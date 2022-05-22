import { Test, TestingModule } from '@nestjs/testing';
import { Scrim.ManagementResolver } from './scrim.management.resolver';

describe('Scrim.ManagementResolver', () => {
  let resolver: Scrim.ManagementResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Scrim.ManagementResolver],
    }).compile();

    resolver = module.get<Scrim.ManagementResolver>(Scrim.ManagementResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
