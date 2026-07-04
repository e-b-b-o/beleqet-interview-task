import { Test, TestingModule } from '@nestjs/testing';
import { ProfileBoostController } from './profile-boost.controller';

describe('ProfileBoostController', () => {
  let controller: ProfileBoostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileBoostController],
    }).compile();

    controller = module.get<ProfileBoostController>(ProfileBoostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
