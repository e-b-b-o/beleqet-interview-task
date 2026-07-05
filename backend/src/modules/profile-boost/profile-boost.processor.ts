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
  targetJobTitle?: string;
  focusArea?: string;
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
    this.logger.log(`[mock-ai] Simulating AI analysis for profile...`);
    
    // Simulate slight delay to mimic AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const hasSkills = input.skills && input.skills.length > 0;
    const score = hasSkills ? 70 + Math.floor(Math.random() * 20) : 55;

    return {
      score,
      feedback: "This is a simulated AI feedback. Your profile looks solid, but expanding your bio and adding specific technical skills could increase your visibility.",
      missingSkills: ["Leadership", "Agile Methodologies", "Cloud Computing"].filter(s => !(input.skills || []).includes(s)),
      headlineSuggest: input.headline ? `Senior ${input.headline.replace('Senior ', '')}` : "Dedicated Professional Seeking Opportunities",
      bioSuggest: input.bio 
        ? `Enhanced version of your bio: ${input.bio} I thrive in collaborative environments and am committed to continuous learning.`
        : "A results-driven professional with a passion for excellence and a track record of delivering high-quality work. Eager to bring my skills to a dynamic team.",
    };
  }
}
