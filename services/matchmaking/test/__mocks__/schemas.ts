import { ScrimState } from '../../src/constants';

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

export const ScrimSchema = {
  parse: (data: unknown) => data as Scrim,
};

export const ScrimParticipantSchema = {
  parse: (data: unknown) => data as ScrimParticipant,
};
