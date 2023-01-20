import {z} from "zod";

export const SteamProfileSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    photos: z.array(z.object({value: z.string()})),
});

export type SteamProfile = z.infer<typeof SteamProfileSchema>;
