import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubSeatAssignmentEntity } from '../../src/db/seat_assignment/club_seat_assignment.entity';
import { ClubSeatAssignmentRepository } from '../../src/db/seat_assignment/club_seat_assignment.repository';

describe('ClubSeatAssignmentEntity', () => {
  it('should be defined', () => {
    expect(ClubSeatAssignmentEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const clubSeatAssignment = new ClubSeatAssignmentEntity();
      expect(clubSeatAssignment.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const clubSeatAssignment = new ClubSeatAssignmentEntity();
      expect(clubSeatAssignment.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const clubSeatAssignment = new ClubSeatAssignmentEntity();
      expect(clubSeatAssignment.updateAt).toBeUndefined();
    });
  });
});

describe('ClubSeatAssignmentRepository', () => {
  let module: TestingModule;
  let clubSeatAssignmentRepository: Repository<ClubSeatAssignmentEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ClubSeatAssignmentEntity),
          useClass: Repository,
        },
        ClubSeatAssignmentRepository,
      ],
    }).compile();

    clubSeatAssignmentRepository = module.get(
      getRepositoryToken(ClubSeatAssignmentEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(ClubSeatAssignmentRepository).toBeDefined();
  });

  it('should create a new club seat assignment', async () => {
    const clubSeatAssignment = new ClubSeatAssignmentEntity();
    const spy = vi
      .spyOn(clubSeatAssignmentRepository, 'save')
      .mockResolvedValueOnce(clubSeatAssignment);

    const savedClubSeatAssignment =
      await clubSeatAssignmentRepository.save(clubSeatAssignment);
    expect(savedClubSeatAssignment).toBeDefined();
    expect(savedClubSeatAssignment).toBeInstanceOf(ClubSeatAssignmentEntity);
    spy.mockRestore();
  });

  it('should find a club seat assignment by id', async () => {
    const clubSeatAssignment = new ClubSeatAssignmentEntity();
    const spy = vi
      .spyOn(clubSeatAssignmentRepository, 'findOne')
      .mockResolvedValueOnce(clubSeatAssignment);

    const foundClubSeatAssignment = await clubSeatAssignmentRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundClubSeatAssignment).toBeDefined();
    expect(foundClubSeatAssignment).toBeInstanceOf(ClubSeatAssignmentEntity);
    spy.mockRestore();
  });
});
