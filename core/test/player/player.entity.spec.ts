import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import * as NestjsTypeorm from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from '../../src/db/player/player.entity';
import { PlayerRepository } from '../../src/db/player/player.repository';

describe('PlayerEntity', () => {
  it('should be defined', () => {
    expect(PlayerEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const player = new PlayerEntity();
      expect(player.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const player = new PlayerEntity();
      expect(player.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const player = new PlayerEntity();
      expect(player.updateAt).toBeUndefined();
    });
  });
});

describe('PlayerRepository', () => {
  let module: TestingModule;
  let playerRepository: Repository<PlayerEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: NestjsTypeorm.getRepositoryToken(PlayerEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    playerRepository = module.get(
      NestjsTypeorm.getRepositoryToken(PlayerEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(PlayerRepository).toBeDefined();
  });

  it('should create a new player', async () => {
    const player = new PlayerEntity();
    const spy = vi.spyOn(playerRepository, 'save').mockResolvedValueOnce(player);

    const savedPlayer = await playerRepository.save(player);
    expect(savedPlayer).toBeDefined();
    expect(savedPlayer).toBeInstanceOf(PlayerEntity);
    spy.mockRestore();
  });

  it('should find a player by id', async () => {
    const player = new PlayerEntity();
    const spy = vi.spyOn(playerRepository, 'findOne').mockResolvedValueOnce(player);

    const foundPlayer = await playerRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundPlayer).toBeDefined();
    expect(foundPlayer).toBeInstanceOf(PlayerEntity);
    spy.mockRestore();
  });
});
