import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity } from '../../src/db/game/game.entity';
import { GameRepository } from '../../src/db/game/game.repository';

describe('GameEntity', () => {
  it('should be defined', () => {
    expect(GameEntity).toBeDefined();
  });

  it('should have id field', () => {
    const game = new GameEntity();
    expect(game.id).toBeUndefined();
  });

  it('should have createdAt field', () => {
    const game = new GameEntity();
    expect(game.createdAt).toBeUndefined();
  });

  it('should have updateAt field', () => {
    const game = new GameEntity();
    expect(game.updateAt).toBeUndefined();
  });
});

describe('GameRepository', () => {
  let module: TestingModule;
  let gameRepository: Repository<GameEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(GameEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    gameRepository = module.get(getRepositoryToken(GameEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(GameRepository).toBeDefined();
  });

  it('should create a new game', async () => {
    const game = new GameEntity();
    const spy = vi.spyOn(gameRepository, 'save').mockResolvedValueOnce(game);

    const savedGame = await gameRepository.save(game);
    expect(savedGame).toBeDefined();
    expect(savedGame).toBeInstanceOf(GameEntity);
    spy.mockRestore();
  });

  it('should find a game by id', async () => {
    const game = new GameEntity();
    const spy = vi.spyOn(gameRepository, 'findOne').mockResolvedValueOnce(game);

    const foundGame = await gameRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundGame).toBeDefined();
    expect(foundGame).toBeInstanceOf(GameEntity);
    spy.mockRestore();
  });
});
