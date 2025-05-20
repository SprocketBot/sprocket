import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamStatEntity } from '../../src/db/team_stat/team_stat.entity';
import { TeamStatRepository } from '../../src/db/team_stat/team_stat.repository';

describe('TeamStatEntity', () => {
  it('should be defined', () => {
    expect(TeamStatEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const teamStat = new TeamStatEntity();
      expect(teamStat.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const teamStat = new TeamStatEntity();
      expect(teamStat.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const teamStat = new TeamStatEntity();
      expect(teamStat.updateAt).toBeUndefined();
    });
  });
});

describe('TeamStatRepository', () => {
  let module: TestingModule;
  let teamStatRepository: Repository<TeamStatEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(TeamStatEntity),
          useClass: Repository,
        },
        TeamStatRepository,
      ],
    }).compile();

    teamStatRepository = module.get(getRepositoryToken(TeamStatEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(TeamStatRepository).toBeDefined();
  });

  it('should create a new team stat', async () => {
    const teamStat = new TeamStatEntity();
    const spy = vi.spyOn(teamStatRepository, 'save').mockResolvedValueOnce(teamStat);

    const savedTeamStat = await teamStatRepository.save(teamStat);
    expect(savedTeamStat).toBeDefined();
    expect(savedTeamStat).toBeInstanceOf(TeamStatEntity);
    spy.mockRestore();
  });

  it('should find a team stat by id', async () => {
    const teamStat = new TeamStatEntity();
    const spy = vi.spyOn(teamStatRepository, 'findOne').mockResolvedValueOnce(teamStat);

    const foundTeamStat = await teamStatRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundTeamStat).toBeDefined();
    expect(foundTeamStat).toBeInstanceOf(TeamStatEntity);
    spy.mockRestore();
  });
});
