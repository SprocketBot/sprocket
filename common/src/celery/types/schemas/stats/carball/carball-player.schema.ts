import { z } from 'zod';

// Player ID schema
export const PlayerIdSchema = z.object({
  id: z.string().optional(),
  platform: z.string().optional(),
}).passthrough();
export type PlayerId = z.infer<typeof PlayerIdSchema>;

// For now, we use z.unknown() for complex nested stats objects
// These can be expanded later with full schemas if needed
export const CarballPlayerStatsSchema = z.object({
  boost: z.unknown().optional(),
  distance: z.unknown().optional(),
  possession: z.unknown().optional(),
  positional_tendencies: z.unknown().optional(),
  averages: z.unknown().optional(),
  hit_counts: z.unknown().optional(),
  camera_changes: z.array(z.unknown()).optional(),
  controller: z.unknown().optional(),
  speed: z.unknown().optional(),
  relative_positioning: z.unknown().optional(),
  per_possession_stats: z.unknown().optional(),
  rumble_stats: z.unknown().optional(),
  ball_carries: z.unknown().optional(),
  kickoff_stats: z.unknown().optional(),
  dropshot_stats: z.unknown().optional(),
  demo_stats: z.unknown().optional(),
}).passthrough();
export type CarballPlayerStats = z.infer<typeof CarballPlayerStatsSchema>;

export const CarballPlayerSchema = z.object({
  id: PlayerIdSchema.optional(),
  name: z.string().optional(),
  title_id: z.coerce.number().optional(),
  score: z.coerce.number().optional(),
  goals: z.coerce.number().optional(),
  assists: z.coerce.number().optional(),
  saves: z.coerce.number().optional(),
  shots: z.coerce.number().optional(),
  camera_settings: z.unknown().optional(),
  loadout: z.unknown().optional(),
  is_orange: z.coerce.number().optional(),
  stats: CarballPlayerStatsSchema.optional(),
  party_leader: PlayerIdSchema.optional(),
  is_bot: z.coerce.boolean().optional(),
  time_in_game: z.coerce.number().optional(),
  first_frame_in_game: z.coerce.number().optional(),
}).passthrough();
export type CarballPlayer = z.infer<typeof CarballPlayerSchema>;
