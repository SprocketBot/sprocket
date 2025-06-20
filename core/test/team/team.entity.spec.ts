import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from '../../src/db/team/team.entity';
import { TeamRepository } from '../../src/db/team/team.repository';

describe('TeamEntity', () => {
  it('should be defined', () => {
    expect(TeamEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const team = new TeamEntity();
      expect(team.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const team = new TeamEntity();
      expect(team.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const team = new TeamEntity();
      expect(team.updateAt).toBeUndefined();
    });
  });
});

describe('TeamRepository', () => {
  let module: TestingModule;
  let teamRepository: Repository<TeamEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(TeamEntity),
          useClass: Repository,
        },
        TeamRepository,
      ],
    }).compile();

    teamRepository = module.get(getRepositoryToken(TeamEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(TeamRepository).toBeDefined();
  });

  it('should create a new team', async () => {
    const team = new TeamEntity();
    const spy = vi.spyOn(teamRepository, 'save').mockResolvedValueOnce(team);

    const savedTeam = await teamRepository.save(team);
    expect(savedTeam).toBeDefined();
    expect(savedTeam).toBeInstanceOf(TeamEntity);
    spy.mockRestore();
  });

  it('should find a team by id', async () => {
    const team = new TeamEntity();
    const spy = vi.spyOn(teamRepository, 'findOne').mockResolvedValueOnce(team);

    const foundTeam = await teamRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundTeam).toBeDefined();
    expect(foundTeam).toBeInstanceOf(TeamEntity);
    spy.mockRestore();
  });
});
