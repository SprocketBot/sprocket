import { z } from 'zod';

// Helper to safely convert to number, returning undefined for invalid values
const safeNumber = () =>
  z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional());

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
  title_id: safeNumber(),
  score: safeNumber(),
  goals: safeNumber(),
  assists: safeNumber(),
  saves: safeNumber(),
  shots: safeNumber(),
  camera_settings: z.unknown().optional(),
  cameraSettings: z.unknown().optional(), // Support camelCase
  loadout: z.unknown().optional(),
  is_orange: safeNumber(),
  isOrange: safeNumber(), // Support camelCase
  stats: CarballPlayerStatsSchema.optional(),
  party_leader: PlayerIdSchema.optional(),
  is_bot: z.coerce.boolean().optional(),
  isBot: z.coerce.boolean().optional(), // Support camelCase
  time_in_game: safeNumber(),
  timeInGame: safeNumber(), // Support camelCase
  first_frame_in_game: safeNumber(),
  firstFrameInGame: safeNumber(), // Support camelCase
  platform: z.string().optional(), // Carball includes platform at player level
}).passthrough();
export type CarballPlayer = z.infer<typeof CarballPlayerSchema>;
