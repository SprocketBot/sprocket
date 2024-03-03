import {z} from "zod";

export enum TeamColor {
    ORANGE = "ORANGE",
    BLUE = "BLUE",
}

export enum GameMode {
    DOUBLES = "DOUBLES",
    STANDARD = "STANDARD",
}

export const PlayerSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
    team: z.nativeEnum(TeamColor),
    mvpr: z.number(),
});

export type PlayerSummary = z.infer<typeof PlayerSummarySchema>;

export const MatchSummarySchema = z.object({
    id: z.number(),
    playedAt: z.string(),
    orangeWon: z.boolean(),
    scoreOrange: z.number(),
    scoreBlue: z.number(),
    blue: z.array(PlayerSummarySchema),
    orange: z.array(PlayerSummarySchema),
});

export type MatchSummary = z.infer<typeof MatchSummarySchema>;

export const CalculateEloForMatch_Input = z.object({
    id: z.number(),
    numGames: z.number(),
    isScrim: z.boolean(),
    gameMode: z.nativeEnum(GameMode),
    gameStats: z.array(MatchSummarySchema),
});

export type CalculateEloForMatchInput = z.infer<typeof CalculateEloForMatch_Input>;

export const CalculateEloForMatch_Output = z.object({});

export const RoundMetadataSchema = MatchSummarySchema.extend({
    uid: z.string(),
    gameMode: z.nativeEnum(GameMode),
    isScrim: z.boolean(),
});

export type RoundMetadata = z.infer<typeof RoundMetadataSchema>;

