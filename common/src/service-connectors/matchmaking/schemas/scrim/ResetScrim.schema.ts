import {z} from "zod";

export const ResetScrim_Request = z.object({
    scrimId: z.string(),
    playerId: z.number(),
});

export const ResetScrim_Response = z.boolean();
