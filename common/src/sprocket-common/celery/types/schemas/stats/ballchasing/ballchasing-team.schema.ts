import {z} from "zod";

import {BallchasingPlayerSchema} from "./ballchasing-player.schema";

export const BallchasingTeamStatsSchema = z.object({
    ball: z.object({
        time_in_side: z.number(),
        possession_time: z.number(),
    }),
    core: z.object({
        goals: z.number(),
        saves: z.number(),
        score: z.number(),
        shots: z.number(),
        assists: z.number(),
        goals_against: z.number(),
        shots_against: z.number(),
        shooting_percentage: z.number(),
    }),
    boost: z.object({
        bpm: z.number(),
        bcpm: z.number(),
        avg_amount: z.number(),
        amount_stolen: z.number(),
        amount_overfill: z.number(),
        time_boost_0_25: z.number(),
        time_full_boost: z.number(),
        time_zero_boost: z.number(),
        amount_collected: z.number(),
        count_stolen_big: z.number(),
        time_boost_25_50: z.number(),
        time_boost_50_75: z.number(),
        amount_stolen_big: z.number(),
        time_boost_75_100: z.number(),
        count_stolen_small: z.number(),
        amount_stolen_small: z.number(),
        count_collected_big: z.number(),
        amount_collected_big: z.number(),
        count_collected_small: z.number(),
        amount_collected_small: z.number(),
        amount_overfill_stolen: z.number(),
        amount_used_while_supersonic: z.number(),
    }),
    movement: z.object({
        time_ground: z.number(),
        time_low_air: z.number(),
        time_high_air: z.number(),
        total_distance: z.number(),
        time_powerslide: z.number(),
        time_slow_speed: z.number(),
        count_powerslide: z.number(),
        time_boost_speed: z.number(),
        time_supersonic_speed: z.number(),
    }),
    positioning: z.object({
        time_behind_ball: z.number(),
        time_infront_ball: z.number(),
        time_neutral_third: z.number(),
        time_defensive_half: z.number(),
        time_offensive_half: z.number(),
        time_defensive_third: z.number(),
        time_offensive_third: z.number(),
    }),
});
export type BallchasingTeamState = z.infer<typeof BallchasingTeamSchema>;

export const BallchasingTeamSchema = z.object({
    name: z.string(),
    color: z.string(),

    stats: BallchasingTeamStatsSchema,
    players: z.array(BallchasingPlayerSchema),
});
export type BallchasingTeam = z.infer<typeof BallchasingTeamSchema>;
