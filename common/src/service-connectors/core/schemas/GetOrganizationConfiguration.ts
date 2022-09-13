import {z} from "zod";

export enum OrganizationConfigurationKeyCode {
    SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES = "SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES",
    SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES = "SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES",
    SCRIM_QUEUE_BAN_DURATION_MODIFIER = "SCRIM_QUEUE_BAN_DURATION_MODIFIER",
    SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS = "SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS",
    PRIMARY_DISCORD_GUILD_SNOWFLAKE = "PRIMARY_DISCORD_GUILD_SNOWFLAKE",
    ALTERNATE_DISCORD_GUILD_SNOWFLAKES = "ALTERNATE_DISCORD_GUILD_SNOWFLAKES",
    REPORT_CARD_DISCORD_WEBHOOK_URL = "REPORT_CARD_DISCORD_WEBHOOK_URL",
    SCRIM_REQUIRED_RATIFICATIONS = "SCRIM_REQUIRED_RATIFICATIONS",
}

// Special constant for the SCRIM_REQUIRED_RATIFICATIONS config key.
export const SCRIM_REQ_RATIFICATION_MAJORITY: number = -1;

export const GetOrganizationConfigurationValue_Request = z.object({
    organizationId: z.number(),
    code: z.nativeEnum(OrganizationConfigurationKeyCode),
});

export const GetOrganizationConfigurationValue_Response = z.union([
    z.array(z.string()),
    z.string(),
    z.number(),
]);
