import {
  Output,
  array,
  boolean,
  coerce,
  date,
  enum_ as valibotEnum,
  number,
  object,
  optional,
  string,
} from 'valibot';

import { ScrimState } from '../constants';

export const ScrimParticipantSchema = object({
  id: string(),
  checkedIn: optional(boolean(), false),
});

export type ScrimParticipant = Output<typeof ScrimParticipantSchema>;

// Create a type-safe enum schema for validation
export const ScrimStateSchema = valibotEnum({
  PENDING: ScrimState.PENDING,
  POPPED: ScrimState.POPPED,
  IN_PROGRESS: ScrimState.IN_PROGRESS,
  RATIFYING: ScrimState.RATIFYING,
  COMPLETE: ScrimState.COMPLETE,
  LOCKED: ScrimState.LOCKED,
  CANCELLED: ScrimState.CANCELLED,
});

export const ScrimSchema = object({
  id: string(),
  authorId: string(),
  participants: array(ScrimParticipantSchema),
  removedParticipants: optional(array(string())),
  pendingTtl: optional(number()),
  participantCount: optional(number()),
  maxParticipants: number(),
  gameId: string(),
  gameModeId: string(),
  skillGroupId: string(),
  state: ScrimStateSchema,
  createdAt: coerce(
    date(),
    (i: unknown) => (i instanceof Date ? i : new Date(i as string | number)),
  ),
});

// First define the base type from the schema
type ScrimBase = Output<typeof ScrimSchema>;

// Then extend it with any additional properties
export type Scrim = {
  id: string;
  authorId: string;
  participants: ScrimParticipant[];
  removedParticipants?: string[];
  pendingTtl?: number;
  participantCount: number;
  maxParticipants: number;
  gameId: string;
  gameModeId: string;
  skillGroupId: string;
  state: ScrimState;
  createdAt: Date;
};

export const CreateScrimOptionsSchema = object({
  pendingTimeout: number(),
});
export type CreateScrimOptions = Output<typeof CreateScrimOptionsSchema>;

export const CreateScrimPayloadSchema = object({
  authorId: string(),
  gameId: string(),
  skillGroupId: string(),
  gameModeId: string(),
  maxParticipants: number(),
  options: optional(CreateScrimOptionsSchema, {
    pendingTimeout: 10 * 60 * 1000, // 10 minutes
  }),
});

export type CreateScrimPayload = Output<typeof CreateScrimPayloadSchema>;

export const DestroyScrimPayloadSchema = object({
  scrimId: string(),
  cancel: optional(boolean(), false),
});

export type DestroyScrimPayload = Output<typeof DestroyScrimPayloadSchema>;

export const JoinScrimPayloadSchema = object({
  scrimId: string(),
  participantId: string(),
});

export type JoinScrimPayload = Output<typeof JoinScrimPayloadSchema>;

export const LeaveScrimPayloadSchema = object({
  participantId: string(),
});

export type LeaveScrimPayload = Output<typeof LeaveScrimPayloadSchema>;

export const ListScrimsPayloadSchema = object({
  gameId: optional(string()),
  skillGroupid: optional(string()),
  state: optional(ScrimStateSchema),
});

export type ListScrimsPayload = Output<typeof ListScrimsPayloadSchema>;

export const GetScrimForUserPayloadSchema = object({
  userId: string(),
});
export type GetScrimForUserPayload = Output<
  typeof GetScrimForUserPayloadSchema
>;
export const AddUserToScrimPayloadSchema = object({
  userId: string(),
  scrimId: string(),
});
export type AddUserToScrimPayload = Output<typeof AddUserToScrimPayloadSchema>;
export const RemoveUserFromScrimPayloadSchema = object({
  userId: string(),
});
export type RemoveUserFromScrimPayload = Output<
  typeof RemoveUserFromScrimPayloadSchema
>;

export const GetScrimPendingTTLPayloadSchema = object({
  scrimId: string(),
});

export type GetScrimPendingTTLPayload = Output<
  typeof GetScrimPendingTTLPayloadSchema
>;
