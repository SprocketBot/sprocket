import { z } from 'zod';

import { CarballPlayerSchema } from './carball-player.schema';

// Team stats schema - using z.unknown() for complex nested objects
export const CarballTeamStatsSchema = z.object({
  possession: z.unknown().optional(),
  hit_counts: z.unknown().optional(),
  center_of_mass: z.unknown().optional(),
  per_possession_stats: z.unknown().optional(),
  rumble_stats: z.unknown().optional(),
  dropshot_stats: z.unknown().optional(),
});
export type CarballTeamStats = z.infer<typeof CarballTeamStatsSchema>;

export const CarballTeamSchema = z.object({
  players: z.array(CarballPlayerSchema).optional(),
  stats: CarballTeamStatsSchema.optional(),
  color: z.number().optional(),
  score: z.number().optional(),
  name: z.string().optional(),
});
export type CarballTeam = z.infer<typeof CarballTeamSchema>;
