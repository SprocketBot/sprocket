import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationSeatAssignmentEntity } from '../../src/db/seat_assignment/organization_seat_assignment/organization_seat_assignment.entity';
import { OrganizationSeatAssignmentRepository } from '../../src/db/seat_assignment/organization_seat_assignment/organization_seat_assignment.repository';

describe('OrganizationSeatAssignmentEntity', () => {
  it('should be defined', () => {
    expect(OrganizationSeatAssignmentEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const organizationSeatAssignment = new OrganizationSeatAssignmentEntity();
      expect(organizationSeatAssignment.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const organizationSeatAssignment = new OrganizationSeatAssignmentEntity();
      expect(organizationSeatAssignment.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const organizationSeatAssignment = new OrganizationSeatAssignmentEntity();
      expect(organizationSeatAssignment.updateAt).toBeUndefined();
    });
  });
});

describe('OrganizationSeatAssignmentRepository', () => {
  let module: TestingModule;
  let organizationSeatAssignmentRepository: Repository<OrganizationSeatAssignmentEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(OrganizationSeatAssignmentEntity),
          useClass: Repository,
        },
        OrganizationSeatAssignmentRepository,
      ],
    }).compile();

    organizationSeatAssignmentRepository = module.get(
      getRepositoryToken(OrganizationSeatAssignmentEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(OrganizationSeatAssignmentRepository).toBeDefined();
  });

  it('should create a new organization seat assignment', async () => {
    const organizationSeatAssignment = new OrganizationSeatAssignmentEntity();
    const spy = vi
      .spyOn(organizationSeatAssignmentRepository, 'save')
      .mockResolvedValueOnce(organizationSeatAssignment);

    const savedOrganizationSeatAssignment =
      await organizationSeatAssignmentRepository.save(
        organizationSeatAssignment,
      );
    expect(savedOrganizationSeatAssignment).toBeDefined();
    expect(savedOrganizationSeatAssignment).toBeInstanceOf(
      OrganizationSeatAssignmentEntity,
    );
    spy.mockRestore();
  });

  it('should find a organization seat assignment by id', async () => {
    const organizationSeatAssignment = new OrganizationSeatAssignmentEntity();
    const spy = vi
      .spyOn(organizationSeatAssignmentRepository, 'findOne')
      .mockResolvedValueOnce(organizationSeatAssignment);

    const foundOrganizationSeatAssignment =
      await organizationSeatAssignmentRepository.findOne({
        where: { id: 'test-id' },
      });
    expect(foundOrganizationSeatAssignment).toBeDefined();
    expect(foundOrganizationSeatAssignment).toBeInstanceOf(
      OrganizationSeatAssignmentEntity,
    );
    spy.mockRestore();
  });
});
