import {z} from "zod";

export const DiscordProfileSchema = z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string(),
    discriminator: z.string(),
    email: z.string(),
});

export type DiscordProfile = z.infer<typeof DiscordProfileSchema>;
