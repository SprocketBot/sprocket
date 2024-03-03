import {z} from "zod";

export const GetNicknameByDiscordUser_Request = z.object({
    discordId: z.string(),
});

export const GetNicknameByDiscordUser_Response = z.string();

export type GetNicknameByDiscordUserResponse = z.infer<typeof GetNicknameByDiscordUser_Response>;
