import { Test, TestingModule } from '@nestjs/testing';

describe('RedisJsonService', () => {
  let service: RedisJsonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisJsonService],
    }).compile();

    service = module.get<RedisJsonService>(RedisJsonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
