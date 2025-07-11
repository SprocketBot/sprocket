import { vi } from 'vitest';

// Mock the schemas module
vi.mock('../src/connector/schemas', () => ({
  __esModule: true,
  Scrim: class {},
  ScrimParticipant: class {},
  ScrimSchema: { parse: (data: unknown) => data },
  ScrimParticipantSchema: { parse: (data: unknown) => data },
}));

// Mock other modules as needed
vi.mock('@sprocketbot/lib', () => ({
  RedLock: () => (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  },
}));
