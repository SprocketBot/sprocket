import { Test, TestingModule } from '@nestjs/testing';
import { MetricsResolver } from './metrics.resolver';

describe('MetricsResolver', () => {
  let resolver: MetricsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsResolver],
    }).compile();

    resolver = module.get<MetricsResolver>(MetricsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
