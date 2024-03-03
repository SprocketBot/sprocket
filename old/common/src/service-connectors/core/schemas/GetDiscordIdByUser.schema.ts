import {z} from "zod";

export const GetDiscordIdByUser_Request = z.number();

export const GetDiscordIdByUser_Response = z.string().optional();

export type GetDiscordIdByUserResponse = z.infer<typeof GetDiscordIdByUser_Response>;
