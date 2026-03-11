import {z} from "zod";

import {BallchasingResponseSchema} from "./stats/ballchasing";
import {CarballResponseSchema} from "./stats/carball";

export const ParseReplay_Request = z.object({
    replayObjectPath: z.string(),
});

export enum Parser {
    CARBALL = "carball",
    BALLCHASING = "ballchasing",
}

// Discriminated union based on parser type
export const ParseReplay_Response = z.discriminatedUnion("parser", [
    z.object({
        parser: z.literal("ballchasing"),
        analysisMode: z.enum(["summary-only", "full-analysis"]).optional(),
        parserVersion: z.union([z.string().transform(v => parseFloat(v)), z.number()]),
        outputPath: z.string(),
        data: BallchasingResponseSchema,
    }),
    z.object({
        parser: z.literal("carball"),
        analysisMode: z.enum(["summary-only", "full-analysis"]).optional(),
        parserVersion: z.union([z.string().transform(v => parseFloat(v)), z.number()]),
        outputPath: z.string(),
        data: CarballResponseSchema,
    }),
]);
export type ParsedReplay = z.infer<typeof ParseReplay_Response>;
