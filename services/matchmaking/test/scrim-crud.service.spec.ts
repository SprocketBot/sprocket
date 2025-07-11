import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest';
import { Test } from '@nestjs/testing';
import { ScrimCrudService } from '../src/scrim-crud/scrim-crud.service';
import { ScrimRepository } from '../src/database/repositories/scrim.repository';
import { ScrimState } from '../src/constants';
import { createMockScrim, createMockParticipant } from './test-utils';
import { Scrim, ScrimParticipant, MockScrim } from './types';

// Mock the schemas module
vi.mock('../src/connector/schemas', () => ({
  Scrim: class {},
  ScrimParticipant: class {},
}));

// Mock @sprocketbot/lib
vi.mock('@sprocketbot/lib', () => ({
  RedLock: () => (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  },
}));

// Extend the ScrimRepository to include custom methods
interface CustomScrimRepository extends ScrimRepository {
  updateState(id: string, state: ScrimState): Promise<Scrim | null>;
  removeParticipant(scrim: Scrim, userId: string): Promise<Scrim | null>;
  findById(id: string): Promise<Scrim | null>;
  findByUserId(userId: string): Promise<Scrim | null>;
}

// Create a mock repository with proper typing
const createMockScrimRepository = () => ({
  // Standard TypeORM methods
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  
  // Custom repository methods
  findById: vi.fn(),
  findByUserId: vi.fn(),
  updateState: vi.fn(),
  removeParticipant: vi.fn(),
  
  // Query builder methods
  createQueryBuilder: vi.fn(() => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    getMany: vi.fn(),
    getOne: vi.fn(),
  })),
  
  // Additional methods used in tests
  findScrims: vi.fn(),
  findScrimById: vi.fn(),
  createScrim: vi.fn(),
  updateScrim: vi.fn(),
  deleteScrim: vi.fn(),
});

// Initialize the mock repository
const mockScrimRepository = createMockScrimRepository();

describe('ScrimCrudService', () => {
  let service: ScrimCrudService;
  let repository: typeof mockScrimRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ScrimCrudService,
        {
          provide: ScrimRepository,
          useValue: mockScrimRepository,
        },
      ],
    }).compile();

    service = module.get<ScrimCrudService>(ScrimCrudService);
    repository = module.get(ScrimRepository);
    jest.clearAllMocks();
  });

  describe('getAllScrims', () => {
    it('should return all scrims', async () => {
      const mockScrims = [createMockScrim() as Scrim, createMockScrim() as Scrim];
      repository.find.mockResolvedValue(mockScrims);

      const result = await service.getAllScrims();

      expect(result).toEqual(mockScrims);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getScrim', () => {
    it('should return a scrim by id', async () => {
      const mockScrim = createMockScrim() as Scrim;
      repository.findOne.mockResolvedValue(mockScrim);

      const result = await service.getScrim(mockScrim.id);

      expect(result).toEqual(mockScrim);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockScrim.id },
      });
    });

    it('should return null if scrim not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const nonExistentId = 'non-existent-id';
      const result = await service.getScrim(nonExistentId);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
    });
  });

  describe('getScrimByUserId', () => {
    it('should return a scrim by user id', async () => {
      const mockScrim = createMockScrim() as Scrim;
      repository.findByUserId.mockResolvedValue(mockScrim);

      const result = await service.getScrimByUserId(mockScrim.authorId);

      expect(result).toEqual(mockScrim);
      expect(repository.findByUserId).toHaveBeenCalledWith(mockScrim.authorId);
    });
  });

  describe('updateScrimState', () => {
    it('should update scrim state', async () => {
      const mockScrim = createMockScrim() as Scrim;
      const updatedScrim = { ...mockScrim, state: ScrimState.POPPED };
      
      repository.updateState.mockResolvedValue(updatedScrim);

      const result = await service.updateScrimState(mockScrim, ScrimState.POPPED);

      expect(result).toEqual(updatedScrim);
      expect(repository.updateState).toHaveBeenCalledWith(mockScrim, ScrimState.POPPED);
    });
  });

  describe('updateScrim', () => {
    it('should update a scrim', async () => {
      const mockScrim = createMockScrim() as Scrim;
      const updatedScrim = { ...mockScrim, gameId: 'new-game-id' } as Scrim;
      
      repository.update.mockResolvedValue(updatedScrim);

      const result = await service.updateScrim(updatedScrim);

      expect(result).toEqual(updatedScrim);
      expect(repository.update).toHaveBeenCalledWith(updatedScrim);
    });
  });

  describe('removeUserFromScrim', () => {
    it('should remove a participant from a scrim', async () => {
      const participant1 = createMockParticipant();
      const participant2 = createMockParticipant();
      const mockScrim = createMockScrim({
        participants: [participant1, participant2],
      }) as Scrim;
      
      const updatedScrim = {
        ...mockScrim,
        participants: [participant1],
      };
      
      repository.update.mockResolvedValue(updatedScrim);

      const result = await service.removeUserFromScrim(mockScrim, participant2.id);

      expect(result).toEqual(updatedScrim);
      expect(repository.update).toHaveBeenCalledWith({
        ...mockScrim,
        participants: [participant1],
      });
    });
  });

  describe('deleteScrim', () => {
    it('should delete a scrim', async () => {
      const mockScrim = createMockScrim() as Scrim;
      
      // Mock the delete operation to succeed
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteScrim(mockScrim);
      
      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalledWith(mockScrim.id);
    });

    it('should return false if scrim is null', async () => {
      const result = await service.deleteScrim(null as any);
      expect(result).toBe(false);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
