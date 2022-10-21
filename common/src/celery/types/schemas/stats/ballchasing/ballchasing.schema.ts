import {z} from "zod";

import {BallchasingTeamSchema} from "./ballchasing-team.schema";

export const BallchasingUploaderSchema = z.object({
    name: z.string(),
    avatar: z.string().url(),
    steam_id: z.string(),
    profile_url: z.string().url(),
});
export type BallchasingUploader = z.infer<typeof BallchasingUploaderSchema>;

export const BallchasingResponseSchema = z.object({
    // Response meta
    id: z.string().uuid(),
    link: z.string().url(),
    title: z.string(),
    date: z.string(),
    date_has_timezone: z.boolean(),
    status: z.literal("ok"),
    created: z.string(),
    visibility: z.string(), // TODO enum
    
    // Rocket League meta
    rocket_league_id: z.string(),
    season: z.number(),
    match_guid: z.string().optional(),

    // Uploader
    recorder: z.string().optional(),
    uploader: BallchasingUploaderSchema,
    
    // Match
    match_type: z.string(), // TODO enum
    
    // Playlist
    playlist_id: z.string(), // TODO enum
    playlist_name: z.string(), // TODO enum
    
    // Map
    map_code: z.string(), // TODO enum for maps
    map_name: z.string().default("UNKNOWN"),
    
    // Duration
    duration: z.number(),
    overtime: z.boolean(),
    overtime_seconds: z.number().optional(),
    
    // Team stats
    team_size: z.number(),
    blue: BallchasingTeamSchema,
    orange: BallchasingTeamSchema,
});
export type BallchasingResponse = z.infer<typeof BallchasingResponseSchema>;
