import {z} from "zod";

import {OrganizationSchema} from "../types";

export const GetOrganizationByDiscordGuild_Request = z.object({
    guildId: z.string().regex(/\d{17,20}/),
});

export const GetOrganizationByDiscordGuild_Response = OrganizationSchema;

export type GetOrganizationByDiscordGuildResponse = z.infer<typeof GetOrganizationByDiscordGuild_Response>;
