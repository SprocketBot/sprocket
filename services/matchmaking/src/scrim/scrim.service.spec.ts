import { Test, TestingModule } from '@nestjs/testing';
import { ScrimService } from './scrim.service';

describe('ScrimService', () => {
  let service: ScrimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrimService],
    }).compile();

    service = module.get<ScrimService>(ScrimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
