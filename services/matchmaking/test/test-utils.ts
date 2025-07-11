import { Scrim, ScrimParticipant, ScrimState } from '../src/connector/schemas';
import { v4 as uuidv4 } from 'uuid';

// Type for ScrimParticipant creation
type ScrimParticipantInput = Omit<ScrimParticipant, 'id' | 'checkedIn'> & {
  id?: string;
  checkedIn?: boolean;
};

// Type for Scrim creation
type ScrimInput = Omit<Scrim, 'id' | 'createdAt' | 'participantCount' | 'removedParticipants'> & {
  id?: string;
  createdAt?: Date | string | number;
  participantCount?: number;
  removedParticipants?: string[];
};

export const createMockParticipant = (
  overrides: ScrimParticipantInput = {},
): ScrimParticipant => ({
  id: overrides.id ?? uuidv4(),
  checkedIn: overrides.checkedIn ?? false,
});

export const createMockScrim = (overrides: Partial<ScrimInput> = {}): Scrim => {
  const author = createMockParticipant(
    overrides.authorId ? { id: overrides.authorId } : {},
  );
  const participants = overrides.participants || [author];
  const authorId = overrides.authorId || author.id;
  const now = new Date();
  
  // Create a scrim object that matches the Scrim interface
  const scrim: Scrim = {
    id: overrides.id ?? uuidv4(),
    authorId,
    gameId: overrides.gameId ?? 'test-game',
    gameModeId: overrides.gameModeId ?? 'test-mode',
    skillGroupId: overrides.skillGroupId ?? 'test-skill-group',
    maxParticipants: overrides.maxParticipants ?? 6,
    state: overrides.state ?? ScrimState.PENDING,
    participants,
    participantCount: overrides.participantCount ?? participants.length,
    createdAt: overrides.createdAt ? new Date(overrides.createdAt) : now,
    pendingTtl: overrides.pendingTtl,
  };

  return scrim;
};

// Mock repository with all required methods
export const mockScrimRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  })),
  // Add any other repository methods used in your tests
} as any;

// Mock Redis client
export const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  expire: jest.fn(),
  // Add other Redis methods as needed
} as any;

// Mock Bull queue
export const mockQueue = {
  add: jest.fn(),
  process: jest.fn(),
  on: jest.fn(),
  // Add other queue methods as needed
} as any;

// Helper function to create a mock module
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMockModule = (providers: any[]) => {
  return {
    get: jest.fn((token: any) => {
      const provider = providers.find((p) => p.provide === token);
      return provider ? provider.useValue : null;
    }),
  };
};
