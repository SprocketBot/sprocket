import { z } from 'zod';

export const SetScrimLocked_Request = z.object({
  scrimId: z.string().uuid(),
  locked: z.boolean(),
});

export const SetScrimLocked_Response = z.boolean();
