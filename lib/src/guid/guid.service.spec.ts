import { Test, TestingModule } from '@nestjs/testing';
import { GuidService } from './guid.service';

describe('GuidService', () => {
  let service: GuidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuidService],
    }).compile();

    service = module.get<GuidService>(GuidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
