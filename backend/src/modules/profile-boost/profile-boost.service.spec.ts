import { Test, TestingModule } from '@nestjs/testing';
import { ProfileBoostService } from './profile-boost.service';

describe('ProfileBoostService', () => {
  let service: ProfileBoostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileBoostService],
    }).compile();

    service = module.get<ProfileBoostService>(ProfileBoostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
