import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameModeEntity } from '../../src/db/game_mode/game_mode.entity';
import { GameModeRepository } from '../../src/db/game_mode/game_mode.repository';

describe('GameModeEntity', () => {
  it('should be defined', () => {
    expect(GameModeEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const gameMode = new GameModeEntity();
      expect(gameMode.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const gameMode = new GameModeEntity();
      expect(gameMode.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const gameMode = new GameModeEntity();
      expect(gameMode.updateAt).toBeUndefined();
    });
  });
});

describe('GameModeRepository', () => {
  let module: TestingModule;
  let gameModeRepository: Repository<GameModeEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(GameModeEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    gameModeRepository = module.get(getRepositoryToken(GameModeEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(GameModeRepository).toBeDefined();
  });

  it('should create a new game mode', async () => {
    const gameMode = new GameModeEntity();
    const spy = vi.spyOn(gameModeRepository, 'save').mockResolvedValueOnce(gameMode);

    const savedGameMode = await gameModeRepository.save(gameMode);
    expect(savedGameMode).toBeDefined();
    expect(savedGameMode).toBeInstanceOf(GameModeEntity);
    spy.mockRestore();
  });

  it('should find a game mode by id', async () => {
    const gameMode = new GameModeEntity();
    const spy = vi.spyOn(gameModeRepository, 'findOne').mockResolvedValueOnce(gameMode);

    const foundGameMode = await gameModeRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundGameMode).toBeDefined();
    expect(foundGameMode).toBeInstanceOf(GameModeEntity);
    spy.mockRestore();
  });
});
