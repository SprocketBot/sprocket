import { Output, object, string } from 'valibot';

export const DiscordProfileSchema = object({
  id: string(),
  username: string(),
  avatar: string(),
  discriminator: string(),
  email: string(),
});

export type DiscordProfile = Output<typeof DiscordProfileSchema>;
