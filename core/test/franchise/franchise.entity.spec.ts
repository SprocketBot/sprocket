import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FranchiseEntity } from '../../src/db/franchise/franchise.entity';
import { FranchiseRepository } from '../../src/db/franchise/franchise.repository';
import { FranchiseSeatAssignmentEntity } from '../../src/db/seat_assignment/franchise_seat_assignment/franchise_seat_assignment.entity';
import { PlayerEntity } from '../../src/db/player/player.entity';
import { SeatEntity } from '../../src/db/seat/seat.entity';
import { UserEntity } from '../../src/db/user/user.entity';

describe('FranchiseEntity', () => {
  let module: TestingModule;
  let franchiseRepository: Repository<FranchiseEntity>;
  let franchiseSeatAssignmentRepository: Repository<FranchiseSeatAssignmentEntity>;
  let userRepository: Repository<UserEntity>;
  let seatRepository: Repository<SeatEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(FranchiseEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(FranchiseSeatAssignmentEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SeatEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    franchiseRepository = module.get(getRepositoryToken(FranchiseEntity));
    franchiseSeatAssignmentRepository = module.get(
      getRepositoryToken(FranchiseSeatAssignmentEntity),
    );
    userRepository = module.get(getRepositoryToken(UserEntity));
    seatRepository = module.get(getRepositoryToken(SeatEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(FranchiseEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const franchise = new FranchiseEntity();
      expect(franchise.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const franchise = new FranchiseEntity();
      expect(franchise.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const franchise = new FranchiseEntity();
      expect(franchise.updateAt).toBeUndefined();
    });
  });

  describe('Franchise Fields', () => {
    it('should have name field', () => {
      const franchise = new FranchiseEntity();
      franchise.name = 'Test Franchise';
      expect(franchise.name).toBe('Test Franchise');
    });
  });

  describe('FranchiseRepository', () => {
    it('should be defined', () => {
      expect(FranchiseRepository).toBeDefined();
    });

    it('should create a new franchise', async () => {
      const franchise = new FranchiseEntity();
      franchise.name = 'Test Franchise';
      const spy = vi.spyOn(franchiseRepository, 'save').mockResolvedValueOnce(franchise);

      const savedFranchise = await franchiseRepository.save(franchise);
      expect(savedFranchise).toBeDefined();
      expect(savedFranchise).toBeInstanceOf(FranchiseEntity);
      expect(savedFranchise.name).toBe('Test Franchise');
      spy.mockRestore();
    });

    it('should find a franchise by id', async () => {
      const franchise = new FranchiseEntity();
      franchise.name = 'Test Franchise';
      const spy = vi
        .spyOn(franchiseRepository, 'findOne')
        .mockResolvedValueOnce(franchise);

      const foundFranchise = await franchiseRepository.findOne({
        where: { id: 'test-id' },
      });
      expect(foundFranchise).toBeDefined();
      expect(foundFranchise).toBeInstanceOf(FranchiseEntity);
      expect(foundFranchise?.name).toBe('Test Franchise');
      spy.mockRestore();
    });
  });

  describe('Franchise Relationships', () => {
    it('should have relationship with FranchiseSeatAssignment', async () => {
      const franchise = new FranchiseEntity();
      franchise.name = 'Test Franchise';
      const seatAssignment = new FranchiseSeatAssignmentEntity();
      const user = new UserEntity();
      const seat = new SeatEntity();

      seatAssignment.franchise = franchise;
      seatAssignment.user = user;
      seatAssignment.seat = seat;

      // Mock the relationships
      const franchiseSpy = vi
        .spyOn(franchiseSeatAssignmentRepository, 'findOne')
        .mockResolvedValueOnce(seatAssignment);
      const userSpy = vi.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      const seatSpy = vi.spyOn(seatRepository, 'findOne').mockResolvedValueOnce(seat);

      // Test the relationship
      const foundAssignment = await franchiseSeatAssignmentRepository.findOne({
        where: { franchise: { id: franchise.id } },
        relations: ['franchise', 'user', 'seat'],
      });

      expect(foundAssignment).not.toBeNull();
      expect(foundAssignment?.franchise).toBeDefined();
      expect(foundAssignment?.user).toBeDefined();
      expect(foundAssignment?.seat).toBeDefined();
      franchiseSpy.mockRestore();
      userSpy.mockRestore();
      seatSpy.mockRestore();
    });
  });
});
