import { z } from 'zod';

import { CarballPlayerSchema } from './carball-player.schema';
import { CarballTeamSchema } from './carball-team.schema';

// Game metadata schema - using z.unknown() for flexible typing since Carball output can vary
export const CarballGameMetadataSchema = z.object({
  id: z.unknown().optional(),
  map: z.unknown().optional(),
  time: z.unknown().optional(),
  frames: z.unknown().optional(),
  length: z.unknown().optional(),
  server_name: z.unknown().optional(),
  match_type: z.unknown().optional(),
  team_size: z.unknown().optional(),
  playlist: z.unknown().optional(),
}).passthrough(); // Allow additional fields we haven't explicitly defined

export type CarballGameMetadata = z.infer<typeof CarballGameMetadataSchema>;

// Game stats schema
export const CarballGameStatsSchema = z.object({
  hits: z.unknown().optional(),
  neutral_possession_time: z.unknown().optional(),
  kickoffs: z.unknown().optional(),
  goals: z.unknown().optional(),
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
  version: z.unknown().optional(),
  mutators: z.unknown().optional(),
}).passthrough(); // Allow any additional fields carball might include

export type CarballResponse = z.infer<typeof CarballResponseSchema>;
