import {z} from "zod";

import {BallchasingPlayerSchema} from "./ballchasing-player.schema";

export const BallchasingTeamStatsSchema = z.object({
    ball: z.object({
        time_in_side: z.number().default(0),
        possession_time: z.number().default(0),
    }),
    core: z.object({
        goals: z.number().default(0),
        saves: z.number().default(0),
        score: z.number().default(0),
        shots: z.number().default(0),
        assists: z.number().default(0),
        goals_against: z.number().default(0),
        shots_against: z.number().default(0),
        shooting_percentage: z.number().default(0),
    }),
    boost: z.object({
        bpm: z.number().default(0),
        bcpm: z.number().default(0),
        avg_amount: z.number().default(0),
        amount_stolen: z.number().default(0),
        amount_overfill: z.number().default(0),
        time_boost_0_25: z.number().default(0),
        time_full_boost: z.number().default(0),
        time_zero_boost: z.number().default(0),
        amount_collected: z.number().default(0),
        count_stolen_big: z.number().default(0),
        time_boost_25_50: z.number().default(0),
        time_boost_50_75: z.number().default(0),
        amount_stolen_big: z.number().default(0),
        time_boost_75_100: z.number().default(0),
        count_stolen_small: z.number().default(0),
        amount_stolen_small: z.number().default(0),
        count_collected_big: z.number().default(0),
        amount_collected_big: z.number().default(0),
        count_collected_small: z.number().default(0),
        amount_collected_small: z.number().default(0),
        amount_overfill_stolen: z.number().default(0),
        amount_used_while_supersonic: z.number().default(0),
    }),
    movement: z.object({
        time_ground: z.number().default(0),
        time_low_air: z.number().default(0),
        time_high_air: z.number().default(0),
        total_distance: z.number().default(0),
        time_powerslide: z.number().default(0),
        time_slow_speed: z.number().default(0),
        count_powerslide: z.number().default(0),
        time_boost_speed: z.number().default(0),
        time_supersonic_speed: z.number().default(0),
    }),
    positioning: z.object({
        time_behind_ball: z.number().default(0),
        time_infront_ball: z.number().default(0),
        time_neutral_third: z.number().default(0),
        time_defensive_half: z.number().default(0),
        time_offensive_half: z.number().default(0),
        time_defensive_third: z.number().default(0),
        time_offensive_third: z.number().default(0),
    }),
});
export type BallchasingTeamStats = z.infer<typeof BallchasingTeamSchema>;

export const BallchasingTeamSchema = z.object({
    name: z.string().optional(),
    color: z.string(),

    stats: BallchasingTeamStatsSchema,
    players: z.array(BallchasingPlayerSchema),
});
export type BallchasingTeam = z.infer<typeof BallchasingTeamSchema>;
