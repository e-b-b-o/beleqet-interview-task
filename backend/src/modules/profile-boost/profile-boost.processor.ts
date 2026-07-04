import { Processor, Process, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger, Injectable } from '@nestjs/common';
import { Job as BullJob } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES, PROFILE_BOOST_JOBS, NOTIFICATION_JOBS } from '../queues/queues.constants';

interface AnalyzeProfilePayload {
  userId: string;
  headline: string | null;
  bio: string | null;
  skills: string[];
}

interface AiProfileScoreResult {
  score: number;
  feedback: string;
  missingSkills: string[];
  headlineSuggest: string | null;
  bioSuggest: string | null;
}

@Injectable()
@Processor(QUEUE_NAMES.PROFILE_BOOST)
export class ProfileBoostProcessor {
  private readonly logger = new Logger(ProfileBoostProcessor.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  @Process(PROFILE_BOOST_JOBS.ANALYZE_PROFILE)
  async handleAnalyzeProfile(job: BullJob<AnalyzeProfilePayload>) {
    this.logger.log(`[analyze-profile] Processing profile for ${job.data.userId}`);
    
    const result = await this.runAiAnalysis(job.data);
    
    await this.prisma.profileBoostReport.create({
      data: {
        userId: job.data.userId,
        score: result.score,
        feedback: result.feedback,
        missingSkills: result.missingSkills,
        headlineSuggest: result.headlineSuggest,
        bioSuggest: result.bioSuggest,
        rawAiResponse: result as object,
      },
    });

    await this.notificationsQueue.add(NOTIFICATION_JOBS.SEND_IN_APP, {
      userId: job.data.userId,
      type: 'profile.boosted',
      title: 'Profile Boost Analysis Complete',
      body: 'Your AI profile analysis is ready. Check your dashboard for actionable feedback.',
      metadata: { score: result.score },
    });

    this.logger.log(`[analyze-profile] Completed for ${job.data.userId} with score ${result.score}`);
  }

  @OnQueueFailed()
  async onFailed(job: BullJob, error: Error) {
    this.logger.error(`[analyze-profile] Job failed id=${job.id}`, error.stack);
  }

  @OnQueueCompleted()
  onCompleted(job: BullJob) {
    this.logger.debug(`[analyze-profile] Job completed id=${job.id}`);
  }

  private async runAiAnalysis(input: AnalyzeProfilePayload): Promise<AiProfileScoreResult> {
    const systemPrompt = `You are an expert career coach for the Ethiopian job market.
Your task is to analyze a candidate's profile and provide actionable feedback.
Always respond ONLY with valid JSON.`;

    const userPrompt = `
Headline: ${input.headline ?? 'None'}
Bio: ${input.bio ?? 'None'}
Skills: ${input.skills?.join(', ') ?? 'None'}

Score this profile (0-100) and return JSON with exactly this shape:
{
  "score": <number 0-100>,
  "feedback": "<2-3 sentence overall feedback>",
  "missingSkills": ["skill1", "skill2"],
  "headlineSuggest": "<Suggested professional headline>",
  "bioSuggest": "<Suggested professional bio>"
}
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as AiProfileScoreResult;

      return {
        score: Math.min(100, Math.max(0, parsed.score ?? 50)),
        feedback: parsed.feedback ?? 'Your profile needs more details.',
        missingSkills: parsed.missingSkills ?? [],
        headlineSuggest: parsed.headlineSuggest ?? null,
        bioSuggest: parsed.bioSuggest ?? null,
      };
    } catch (err) {
      this.logger.warn(`OpenAI call failed, using fallback scoring: ${(err as Error).message}`);
      return {
        score: 60,
        feedback: 'AI analysis unavailable. We recommend adding more skills and a detailed bio.',
        missingSkills: ['Communication', 'Teamwork'],
        headlineSuggest: input.headline ?? 'Experienced Professional',
        bioSuggest: input.bio ?? 'Passionate professional looking for new opportunities.',
      };
    }
  }
}
