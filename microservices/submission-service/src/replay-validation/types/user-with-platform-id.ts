import type {GetUserByDiscordIdResponse} from "@sprocketbot/common";

export type UserWithPlatformId = GetUserByDiscordIdResponse & {
    platform: string;
    platformId: string;
};
