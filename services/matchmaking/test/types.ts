import { ScrimState } from '../src/constants';

export interface ScrimParticipant {
  id: string;
  checkedIn: boolean;
}

export interface Scrim {
  id: string;
  authorId: string;
  participants: ScrimParticipant[];
  participantCount: number;
  maxParticipants: number;
  gameId: string;
  gameModeId: string;
  skillGroupId: string;
  state: ScrimState;
  createdAt: Date;
  removedParticipants?: string[];
  pendingTtl?: number;
}

export type MockScrim = Partial<Scrim> & { id: string };
