import { Output, object, optional, string } from 'valibot';

export const DiscordProfileSchema = object({
  id: string(),
  username: string(),
  avatarUrl: string(),
  discriminator: optional(string()),
  email: optional(string()),
});

export type DiscordProfile = Output<typeof DiscordProfileSchema>;
