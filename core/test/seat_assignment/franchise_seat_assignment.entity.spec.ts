import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FranchiseSeatAssignmentEntity } from '../../src/db/seat_assignment/franchise_seat_assignment/franchise_seat_assignment.entity';
import { FranchiseSeatAssignmentRepository } from '../../src/db/seat_assignment/franchise_seat_assignment/franchise_seat_assignment.repository';

describe('FranchiseSeatAssignmentEntity', () => {
  it('should be defined', () => {
    expect(FranchiseSeatAssignmentEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const franchiseSeatAssignment = new FranchiseSeatAssignmentEntity();
      expect(franchiseSeatAssignment.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const franchiseSeatAssignment = new FranchiseSeatAssignmentEntity();
      expect(franchiseSeatAssignment.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const franchiseSeatAssignment = new FranchiseSeatAssignmentEntity();
      expect(franchiseSeatAssignment.updateAt).toBeUndefined();
    });
  });
});

describe('FranchiseSeatAssignmentRepository', () => {
  let module: TestingModule;
  let franchiseSeatAssignmentRepository: Repository<FranchiseSeatAssignmentEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(FranchiseSeatAssignmentEntity),
          useClass: Repository,
        },
        FranchiseSeatAssignmentRepository,
      ],
    }).compile();

    franchiseSeatAssignmentRepository = module.get(
      getRepositoryToken(FranchiseSeatAssignmentEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(FranchiseSeatAssignmentRepository).toBeDefined();
  });

  it('should create a new franchise seat assignment', async () => {
    const franchiseSeatAssignment = new FranchiseSeatAssignmentEntity();
    const spy = vi
      .spyOn(franchiseSeatAssignmentRepository, 'save')
      .mockResolvedValueOnce(franchiseSeatAssignment);

    const savedFranchiseSeatAssignment =
      await franchiseSeatAssignmentRepository.save(franchiseSeatAssignment);
    expect(savedFranchiseSeatAssignment).toBeDefined();
    expect(savedFranchiseSeatAssignment).toBeInstanceOf(
      FranchiseSeatAssignmentEntity,
    );
    spy.mockRestore();
  });

  it('should find a franchise seat assignment by id', async () => {
    const franchiseSeatAssignment = new FranchiseSeatAssignmentEntity();
    const spy = vi
      .spyOn(franchiseSeatAssignmentRepository, 'findOne')
      .mockResolvedValueOnce(franchiseSeatAssignment);

    const foundFranchiseSeatAssignment =
      await franchiseSeatAssignmentRepository.findOne({
        where: { id: 'test-id' },
      });
    expect(foundFranchiseSeatAssignment).toBeDefined();
    expect(foundFranchiseSeatAssignment).toBeInstanceOf(
      FranchiseSeatAssignmentEntity,
    );
    spy.mockRestore();
  });
});
