import {z} from "zod";

export const ScrimJoinOptionsSchema = z.object({
    userId: z.number(),
    playerName: z.string(),
    leaveAfter: z.number().min(0),
    createGroup: z.boolean().optional(),
    joinGroup: z.string().optional(),
    canSaveDemos: z.boolean(),
});

export type ScrimJoinOptions = z.infer<typeof ScrimJoinOptionsSchema>;
