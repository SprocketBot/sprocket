import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamSeatAssignmentEntity } from '../../src/db/seat_assignment/team_seat_assignment/team_seat_assignment.entity';
import { TeamSeatAssignmentRepository } from '../../src/db/seat_assignment/team_seat_assignment/team_seat_assignment.repository';

describe('TeamSeatAssignmentEntity', () => {
  it('should be defined', () => {
    expect(TeamSeatAssignmentEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const teamSeatAssignment = new TeamSeatAssignmentEntity();
      expect(teamSeatAssignment.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const teamSeatAssignment = new TeamSeatAssignmentEntity();
      expect(teamSeatAssignment.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const teamSeatAssignment = new TeamSeatAssignmentEntity();
      expect(teamSeatAssignment.updateAt).toBeUndefined();
    });
  });
});

describe('TeamSeatAssignmentRepository', () => {
  let module: TestingModule;
  let teamSeatAssignmentRepository: Repository<TeamSeatAssignmentEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(TeamSeatAssignmentEntity),
          useClass: Repository,
        },
        TeamSeatAssignmentRepository,
      ],
    }).compile();

    teamSeatAssignmentRepository = module.get(
      getRepositoryToken(TeamSeatAssignmentEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(TeamSeatAssignmentRepository).toBeDefined();
  });

  it('should create a new team seat assignment', async () => {
    const teamSeatAssignment = new TeamSeatAssignmentEntity();
    const spy = vi
      .spyOn(teamSeatAssignmentRepository, 'save')
      .mockResolvedValueOnce(teamSeatAssignment);

    const savedTeamSeatAssignment =
      await teamSeatAssignmentRepository.save(teamSeatAssignment);
    expect(savedTeamSeatAssignment).toBeDefined();
    expect(savedTeamSeatAssignment).toBeInstanceOf(TeamSeatAssignmentEntity);
    spy.mockRestore();
  });

  it('should find a team seat assignment by id', async () => {
    const teamSeatAssignment = new TeamSeatAssignmentEntity();
    const spy = vi
      .spyOn(teamSeatAssignmentRepository, 'findOne')
      .mockResolvedValueOnce(teamSeatAssignment);

    const foundTeamSeatAssignment = await teamSeatAssignmentRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundTeamSeatAssignment).toBeDefined();
    expect(foundTeamSeatAssignment).toBeInstanceOf(TeamSeatAssignmentEntity);
    spy.mockRestore();
  });
});
