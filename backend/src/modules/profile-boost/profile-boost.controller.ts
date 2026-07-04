import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { ProfileBoostService } from './profile-boost.service';

@ApiTags('profile-boost')
@Controller('profile-boost')
export class ProfileBoostController {
  constructor(private readonly profileBoostService: ProfileBoostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request an AI profile boost analysis' })
  @ApiResponse({ status: 202, description: 'Profile boost analysis queued successfully.' })
  @HttpCode(HttpStatus.ACCEPTED)
  async requestProfileBoost(@CurrentUser() u: CurrentUserPayload) {
    return this.profileBoostService.queueAnalysis(u.userId);
  }
}
