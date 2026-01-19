import { z } from 'zod';

export const CheckInToScrim_Request = z.object({
  scrimId: z.string().uuid(),
  playerId: z.number(),
});

export const CheckInToScrim_Response = z.boolean();
