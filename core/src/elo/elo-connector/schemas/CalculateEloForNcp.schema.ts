import { z } from 'zod';

export const CalculateEloForNcp_Input = z.object({
  roundIds: z.array(z.number()),
  isNcp: z.boolean(),
});

export const CalculateEloForNcp_Output = z.object({});
