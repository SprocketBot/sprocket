import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest';
import { Test } from '@nestjs/testing';
import { MatchmakingService } from '../src/connector/matchmaking.service';
import { Scrim } from '../src/connector/schemas';
import { MatchmakingEndpoint } from '../src/constants';

// Mock the client
const mockClient = {
  send: vi.fn(),
};

describe('MatchmakingService', () => {
  let service: MatchmakingService;
  let sendSpy: MockInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MatchmakingService,
        {
          provide: 'MATCHMAKING_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    service = module.get<MatchmakingService>(MatchmakingService);
    sendSpy = vi.spyOn(mockClient, 'send');
    vi.clearAllMocks();
  });

  describe('listScrims', () => {
    it('should return a list of scrims', async () => {
      const mockScrims: Scrim[] = [
        {
          id: '1',
          authorId: 'user1',
          participants: [],
          participantCount: 0,
          maxParticipants: 6,
          gameId: 'game1',
          gameModeId: 'mode1',
          skillGroupId: 'skill1',
          state: 'PENDING',
          createdAt: new Date(),
        },
      ] as Scrim[];

      mockClient.send.mockResolvedValue(mockScrims);

      const result = await service.listScrims({});

      expect(result).toEqual(mockScrims);
      expect(sendSpy).toHaveBeenCalledWith(MatchmakingEndpoint.ListScrims, {});
    });
  });

  describe('createScrim', () => {
    it('should create a scrim', async () => {
      const mockScrim: Scrim = {
        id: '1',
        authorId: 'user1',
        participants: [],
        participantCount: 0,
        maxParticipants: 6,
        gameId: 'game1',
        gameModeId: 'mode1',
        skillGroupId: 'skill1',
        state: 'PENDING',
        createdAt: new Date(),
      } as Scrim;

      mockClient.send.mockResolvedValue(mockScrim);

      const payload = {
        authorId: 'user1',
        gameId: 'game1',
        gameModeId: 'mode1',
        skillGroupId: 'skill1',
        maxParticipants: 6,
        options: {
          pendingTimeout: 300,
        },
      };

      const result = await service.createScrim(payload);

      expect(result).toEqual(mockScrim);
      expect(sendSpy).toHaveBeenCalledWith(MatchmakingEndpoint.CreateScrim, payload);
    });
  });
});
