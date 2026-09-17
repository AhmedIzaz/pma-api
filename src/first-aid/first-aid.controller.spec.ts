import { Test, TestingModule } from '@nestjs/testing';
import { FirstAidController } from './first-aid.controller';
import { FirstAidService } from './first-aid.service';

describe('FirstAidController', () => {
  let controller: FirstAidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FirstAidController],
      providers: [FirstAidService],
    }).compile();

    controller = module.get<FirstAidController>(FirstAidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
