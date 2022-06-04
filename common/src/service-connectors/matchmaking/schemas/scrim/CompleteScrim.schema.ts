import {z} from "zod";

export const CompleteScrim_Request = z.object({
    scrimId: z.string().uuid(),
    playerId: z.number(),
});

export const CompleteScrim_Response = z.boolean();
