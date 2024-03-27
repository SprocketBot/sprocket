import { Output, object, string } from 'valibot';

export const CreateScrimPayloadSchema = object({
  authorId: string(),
  gameId: string(),
  skillGroupId: string(),
});

export type CreateScrimPayload = Output<typeof CreateScrimPayloadSchema>;
