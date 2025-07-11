import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsRelations, DeepPartial, FindOneOptions, FindOptionsSelect } from 'typeorm';
import { Scrim as ScrimType, ScrimState } from '../src/connector/schemas';
import { ScrimRepository } from '../src/database/repositories/scrim.repository';
import { createMockScrim } from './test-utils';
import { Scrim } from '../src/database/entities/scrim.entity';
import { Participant } from '../src/database/entities/participant.entity';

// Simple mock repository implementation
const createMockRepository = () => ({
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  createQueryBuilder: vi.fn(() => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    getMany: vi.fn(),
  })),
});

type MockRepository = ReturnType<typeof createMockRepository>;

// Mock the Scrim entity
interface MockScrim {
  id: string;
  authorId: string;
  participants: any[];
  participantCount: number;
  gameId: string;
  gameModeId: string;
  skillGroupId: string;
  maxParticipants: number;
  state: any;
  createdAt: Date;
  updatedAt: Date;
  pendingTtl?: number;
}

// Mock the Scrim class that implements Scrim interface
class MockScrimClass implements Scrim {
  id: string;
  authorId: string;
  participants: any[] = [];
  participantCount: number = 0;
  gameId: string = '';
  gameModeId: string = '';
  skillGroupId: string = '';
  maxParticipants: number = 6;
  state: any;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  pendingTtl?: number;

  constructor(data: Partial<MockScrim> = {}) {
    // Set default values for required fields
    this.id = data.id || 'test-id';
    this.authorId = data.authorId || 'test-author';
    this.participants = data.participants || [];
    this.participantCount = data.participantCount || 0;
    this.gameId = data.gameId || 'test-game';
    this.gameModeId = data.gameModeId || 'test-mode';
    this.skillGroupId = data.skillGroupId || 'test-skill';
    this.maxParticipants = data.maxParticipants || 6;
    this.state = data.state || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    if (data.pendingTtl !== undefined) {
      this.pendingTtl = data.pendingTtl;
    }
  }

  // Implement any required methods from Scrim interface
  hasId(): boolean {
    return !!this.id;
  }

  save(): Promise<this> {
    return Promise.resolve(this);
  }

  remove(): Promise<this> {
    return Promise.resolve(this);
  }

  reload(): Promise<void> {
    return Promise.resolve();
  }
}

// We'll use dependency injection instead of module mocking
// to avoid issues with jest.mock in this context

// Create a mock implementation of the schemas module
const mockSchemas = {
  Scrim: MockScrimClass,
} as const;

describe('ScrimRepository', () => {
  let repository: ScrimRepository;
  let mockScrimRepository: MockRepository;
  let mockParticipantRepository: MockRepository;

  beforeEach(async () => {
    // Create mock repositories
    mockScrimRepository = createMockRepository();
    mockParticipantRepository = createMockRepository();
    
    // Set up default mock implementations
    mockScrimRepository.findOne = jest.fn().mockImplementation((options: any) => {
      if (options?.where?.id === 'non-existent-id') {
        return Promise.resolve(null);
      }
      const scrim = new MockScrimClass({ 
        id: options?.where?.id || 'test-id',
        authorId: 'test-author',
        participants: [],
        participantCount: 0,
        gameId: 'test-game',
        gameModeId: 'test-mode',
        skillGroupId: 'test-skill',
        maxParticipants: 6,
        state: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return Promise.resolve(scrim);
    });
    
    mockScrimRepository.save = jest.fn().mockImplementation((entity: any) => Promise.resolve(entity));
    mockScrimRepository.delete = jest.fn().mockResolvedValue({ affected: 1 } as any);
    
    mockParticipantRepository.findOne = jest.fn().mockResolvedValue({
      id: 'participant-1',
      userId: 'test-user',
      scrim: new MockScrimClass({
        id: 'test-scrim',
        authorId: 'test-author',
        participants: [],
        participantCount: 0,
        gameId: 'test-game',
        gameModeId: 'test-mode',
        skillGroupId: 'test-skill',
        maxParticipants: 6,
        state: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrimRepository,
        {
          provide: getRepositoryToken(Scrim),
          useValue: mockScrimRepository,
        },
        {
          provide: getRepositoryToken(Participant),
          useValue: mockParticipantRepository,
        },
      ],
    }).compile();

    repository = module.get<ScrimRepository>(ScrimRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return a scrim by id', async () => {
      const mockScrim = createMockScrim();
      const mockEntity = new MockScrimClass(mockScrim);
      mockScrimRepository.findOne?.mockResolvedValueOnce(mockEntity);

      const result = await repository.findById(mockScrim.id);

      expect(result).toBeDefined();
      expect(result?.id).toEqual(mockScrim.id);
      expect(mockScrimRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockScrim.id },
        relations: ['participants'],
      });
    });

    it('should return null if scrim not found', async () => {
      mockScrimRepository.findOne?.mockResolvedValueOnce(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
      expect(mockScrimRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        relations: ['participants'],
      });
    });
  });

  describe('create', () => {
    it('should create a scrim', async () => {
      const mockScrim = createMockScrim();
      const mockEntity = new MockScrimClass(mockScrim);
      
      mockScrimRepository.create?.mockReturnValue(mockEntity);
      mockScrimRepository.save?.mockResolvedValue(mockEntity);

      const result = await repository.create(mockScrim);

      expect(result).toBeDefined();
      expect(result.id).toEqual(mockScrim.id);
      expect(mockScrimRepository.create).toHaveBeenCalled();
      expect(mockScrimRepository.save).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should return a scrim by user id', async () => {
      const mockScrim = createMockScrim();
      const mockParticipant = {
        id: 'participant-1',
        userId: 'user-1',
        scrim: mockScrim,
      };
      
      mockParticipantRepository.findOne?.mockResolvedValueOnce(mockParticipant);

      const result = await repository.findByUserId('user-1');

      expect(result).toBeDefined();
      expect(mockParticipantRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['scrim', 'scrim.participants'],
      });
    });

    it('should return null if participant not found', async () => {
      mockParticipantRepository.findOne?.mockResolvedValueOnce(null);

      const result = await repository.findByUserId('non-existent-user');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a scrim', async () => {
      const mockScrim = createMockScrim();
      mockScrimRepository.findOne?.mockResolvedValueOnce(new MockScrimClass(mockScrim));
      mockScrimRepository.delete?.mockResolvedValueOnce({ affected: 1 } as any);

      const result = await repository.delete(mockScrim.id);

      expect(result).toBe(true);
      expect(mockScrimRepository.delete).toHaveBeenCalledWith(mockScrim.id);
    });

    it('should return true if scrim is deleted', async () => {
      // Mock the delete to return that one row was affected
      mockScrimRepository.delete = jest.fn().mockResolvedValueOnce({ affected: 1 });
      
      // The delete method should return true when scrim is deleted
      const result = await repository.delete('test-id');
      expect(result).toBe(true);
      expect(mockScrimRepository.delete).toHaveBeenCalledWith('test-id');
    });
    
    it('should return false if scrim is not found', async () => {
      // Mock the delete to return that no rows were affected
      mockScrimRepository.delete = jest.fn().mockResolvedValueOnce({ affected: 0 });
      
      // The delete method should return false when scrim is not found
      const result = await repository.delete('non-existent-id');
      expect(result).toBe(false);
    });
  });
});
