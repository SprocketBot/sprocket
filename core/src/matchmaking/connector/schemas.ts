import {
  Output,
  array,
  boolean,
  coerce,
  date,
  enum_,
  integer,
  number,
  object,
  optional,
  string,
  transform,
} from 'valibot';
import { ScrimState } from '../constants';

export const ScrimParticipantSchema = object({
  id: string(),
  checkedIn: optional(boolean(), false),
});

export type ScrimParticipant = Output<typeof ScrimParticipantSchema>;

export const ScrimSchema = transform(
  object({
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
    state: enum_(ScrimState),
    createdAt: coerce(date(), (i: string | Date) => new Date(i)),
  }),
  (v) => {
    return {
      ...v,
      // If participants is available, but count for some reason is not
      participantCount: v.participantCount ?? v.participants.length,
    };
  },
);
export type Scrim = Output<typeof ScrimSchema>;

export const CreateScrimOptionsSchema = object({
  pendingTimeout: number([integer()]),
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
  state: optional(enum_(ScrimState)),
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
