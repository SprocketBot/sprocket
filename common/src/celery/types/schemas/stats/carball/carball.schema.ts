import { z } from 'zod';

import { CarballPlayerSchema } from './carball-player.schema';
import { CarballTeamSchema } from './carball-team.schema';

// Game metadata schema - using proper types to match BallchasingResponse expectations
// Numeric fields use coerce to automatically convert strings to numbers
export const CarballGameMetadataSchema = z.object({
  id: z.string().optional(),
  map: z.string().optional(),
  time: z.string().optional(),
  frames: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  server_name: z.string().optional(),
  match_type: z.string().optional(),
  team_size: z.coerce.number().optional(),
  playlist: z.coerce.number().optional(),
}).passthrough(); // Allow additional fields we haven't explicitly defined

export type CarballGameMetadata = z.infer<typeof CarballGameMetadataSchema>;

// Game stats schema
export const CarballGameStatsSchema = z.object({
  hits: z.array(z.unknown()).optional(),
  neutral_possession_time: z.coerce.number().optional(),
  kickoffs: z.array(z.unknown()).optional(),
  goals: z.array(z.unknown()).optional(),
}).passthrough(); // Allow additional fields

export type CarballGameStats = z.infer<typeof CarballGameStatsSchema>;

// Party schema
export const CarballPartySchema = z.object({
  leader: z.unknown().optional(),
  members: z.array(z.unknown()).optional(),
}).passthrough();
export type CarballParty = z.infer<typeof CarballPartySchema>;

// Main Carball Response schema matching the protobuf Game structure
export const CarballResponseSchema = z.object({
  gameMetadata: CarballGameMetadataSchema.optional(),
  game_metadata: CarballGameMetadataSchema.optional(), // Support both camelCase and snake_case
  players: z.array(CarballPlayerSchema).optional(),
  teams: z.array(CarballTeamSchema).optional(),
  gameStats: CarballGameStatsSchema.optional(),
  game_stats: CarballGameStatsSchema.optional(), // Support both camelCase and snake_case
  parties: z.array(CarballPartySchema).optional(),
  version: z.coerce.number().optional(),
  mutators: z.unknown().optional(),
}).passthrough(); // Allow any additional fields carball might include

export type CarballResponse = z.infer<typeof CarballResponseSchema>;
