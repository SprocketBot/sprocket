import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GameModeResolver } from './game_mode.resolver';

describe('GameModeResolver', () => {
  let resolver: GameModeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameModeResolver],
    }).compile();

    resolver = module.get<GameModeResolver>(GameModeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
