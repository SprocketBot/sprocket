import { z } from 'zod';

import { ScrimJoinOptionsSchema, ScrimSchema, ScrimSettingsSchema } from '../../types';

export const CreateLFSScrim_Request = z.object({
  authorId: z.number(),
  organizationId: z.number(),
  gameModeId: z.number(),
  skillGroupId: z.number(),
  settings: ScrimSettingsSchema,
  numRounds: z.number(),
  join: ScrimJoinOptionsSchema,
});

export type CreateLFSScrimRequest = z.infer<typeof CreateLFSScrim_Request>;

export const CreateLFSScrim_Response = ScrimSchema;
