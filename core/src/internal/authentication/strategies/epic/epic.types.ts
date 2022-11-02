import {z} from "zod";

export const EpicProfileSchema = z.object({
    sub: z.string(),
    preferred_username: z.string(),
});

export type EpicProfile = z.infer<typeof EpicProfileSchema>;
