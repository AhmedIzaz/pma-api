import { Test, TestingModule } from '@nestjs/testing';
import { FirstAidService } from './first-aid.service';

describe('FirstAidService', () => {
  let service: FirstAidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirstAidService],
    }).compile();

    service = module.get<FirstAidService>(FirstAidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
