import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAMES } from '../queues/queues.constants';
import { ProfileBoostController } from './profile-boost.controller';
import { ProfileBoostService } from './profile-boost.service';
import { ProfileBoostProcessor } from './profile-boost.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.PROFILE_BOOST },
      { name: QUEUE_NAMES.NOTIFICATIONS },
    ),
  ],
  controllers: [ProfileBoostController],
  providers: [ProfileBoostService, ProfileBoostProcessor],
  exports: [ProfileBoostService],
})
export class ProfileBoostModule {}
