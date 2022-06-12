import {z} from "zod";

export enum OrganizationConfigurationKeyCode {
    SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES = "SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES",
    SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES = "SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES",
    SCRIM_QUEUE_BAN_DURATION_MODIFIER = "SCRIM_QUEUE_BAN_DURATION_MODIFIER",
    SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS = "SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS",
    PRIMARY_DISCORD_GUILD_SNOWFLAKE = "PRIMARY_DISCORD_GUILD_SNOWFLAKE",
    ALTERNATE_DISCORD_GUILD_SNOWFLAKES = "ALTERNATE_DISCORD_GUILD_SNOWFLAKES",
    REPORT_CARD_CHANNEL_SNOWFLAKE = "REPORT_CARD_CHANNEL_SNOWFLAKE",
}

export const GetOrganizationConfigurationValue_Request = z.object({
    organizationId: z.number(),
    code: z.nativeEnum(OrganizationConfigurationKeyCode),
});

export const GetOrganizationConfigurationValue_Response = z.union([
    z.array(z.string()),
    z.string(),
    z.number(),
]);
