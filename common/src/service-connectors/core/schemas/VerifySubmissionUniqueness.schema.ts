import {z} from "zod";

import {DateSchema} from "../../../types";

export const VerifySubmissionUniquenessPlayerSchema = z.object({
    player_id: z.number(),
    shots: z.number(),
    saves: z.number(),
    goals: z.number(),
    assists: z.number(),
    color: z.enum(["BLUE", "ORANGE"]),
});

export type VerifySubmissionUniquenessPlayerData = z.infer<typeof VerifySubmissionUniquenessPlayerSchema>;

export const VerifySubmissionUniquenessSchema = z.array(VerifySubmissionUniquenessPlayerSchema);

export type VerifySubmissionUniquenessData = z.infer<typeof VerifySubmissionUniquenessSchema>;

export const VerifySubmissionUniqueness_Request = z.object({
    data: VerifySubmissionUniquenessSchema,
    playedAt: DateSchema,
});

export const VerifySubmissionUniqueness_Response = z.boolean();
