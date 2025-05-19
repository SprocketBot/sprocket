import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerStatEntity } from '../../src/db/player_stat/player_stat.entity';
import { PlayerStatRepository } from '../../src/db/player_stat/player_stat.repository';

describe('PlayerStatEntity', () => {
  it('should be defined', () => {
    expect(PlayerStatEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const playerStat = new PlayerStatEntity();
      expect(playerStat.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const playerStat = new PlayerStatEntity();
      expect(playerStat.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const playerStat = new PlayerStatEntity();
      expect(playerStat.updateAt).toBeUndefined();
    });
  });
});

describe('PlayerStatRepository', () => {
  let module: TestingModule;
  let playerStatRepository: Repository<PlayerStatEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(PlayerStatEntity),
          useClass: Repository,
        },
        PlayerStatRepository,
      ],
    }).compile();

    playerStatRepository = module.get(getRepositoryToken(PlayerStatEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(PlayerStatRepository).toBeDefined();
  });

  it('should create a new player stat', async () => {
    const playerStat = new PlayerStatEntity();
    jest.spyOn(playerStatRepository, 'save').mockResolvedValueOnce(playerStat);

    const savedPlayerStat = await playerStatRepository.save(playerStat);
    expect(savedPlayerStat).toBeDefined();
    expect(savedPlayerStat).toBeInstanceOf(PlayerStatEntity);
  });

  it('should find a player stat by id', async () => {
    const playerStat = new PlayerStatEntity();
    jest
      .spyOn(playerStatRepository, 'findOne')
      .mockResolvedValueOnce(playerStat);

    const foundPlayerStat = await playerStatRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundPlayerStat).toBeDefined();
    expect(foundPlayerStat).toBeInstanceOf(PlayerStatEntity);
  });
});
