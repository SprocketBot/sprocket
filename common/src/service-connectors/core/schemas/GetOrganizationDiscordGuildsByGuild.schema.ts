import {z} from "zod";

export const GetOrganizationDiscordGuildsByGuild_Request = z.object({
    guildId: z.string().regex(/\d{17,20}/),
});

export const GetOrganizationDiscordGuildsByGuild_Response = z.object({
    primary: z.string().regex(/\d{17,20}/),
    alternate: z.array(z.string().regex(/\d{17,20}/)),
});

export type GetOrganizationDiscordGuildsByGuildResponse = z.infer<
  typeof GetOrganizationDiscordGuildsByGuild_Response
>;
