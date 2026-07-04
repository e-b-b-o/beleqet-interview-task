import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAMES, PROFILE_BOOST_JOBS } from '../queues/queues.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestProfileBoostDto } from './dto/request-profile-boost.dto';

@Injectable()
export class ProfileBoostService {
  private readonly logger = new Logger(ProfileBoostService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.PROFILE_BOOST) private readonly profileBoostQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async queueAnalysis(userId: string, dto?: RequestProfileBoostDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    await this.profileBoostQueue.add(PROFILE_BOOST_JOBS.ANALYZE_PROFILE, {
      userId: user.id,
      headline: user.headline,
      bio: user.bio,
      skills: user.skills,
      targetJobTitle: dto?.targetJobTitle,
      focusArea: dto?.focusArea,
    });

    this.logger.log(`Queued profile boost analysis for user ${userId}`);
    return { message: 'Profile boost analysis queued successfully' };
  }
}
