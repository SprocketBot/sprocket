import { z } from 'zod';

export const LeaveScrim_Request = z.object({
  scrimId: z.string().uuid(),
  playerId: z.number(),
});

export const LeaveScrim_Response = z.boolean();
