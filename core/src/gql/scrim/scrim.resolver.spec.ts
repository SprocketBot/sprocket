import { Test, TestingModule } from '@nestjs/testing';
import { ScrimResolver } from './scrim.resolver';

describe('ScrimResolver', () => {
  let resolver: ScrimResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrimResolver],
    }).compile();

    resolver = module.get<ScrimResolver>(ScrimResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
