import {z} from "zod";

export const ScrimJoinOptionsSchema = z.object({
    scrimId: z.string().uuid(),
    playerId: z.number(),
    playerName: z.string(),
    leaveAfter: z.number().min(0),
    createGroup: z.boolean().optional(),
    joinGroup: z.string().optional(),
});

export type ScrimJoinOptions = z.infer<typeof ScrimJoinOptionsSchema>;
