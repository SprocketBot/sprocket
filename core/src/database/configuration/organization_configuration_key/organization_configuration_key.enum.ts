import {registerEnumType} from "@nestjs/graphql";

export enum OrganizationConfigurationKeyCode {
    /**
     * The amount of time in minutes after a scrim pops to wait before cancelling the scrim and issuing queue bans.
     */
    SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES = "SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES",
    /**
     * The amount of time in minutes that a member will be queue banned on their first occurrence.
     */
    SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES = "SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES",
    /**
     * The amount of time in minutes that is multiplied by the number of previous queue bans and added to the initial ban duration.
     */
    SCRIM_QUEUE_BAN_DURATION_MODIFIER = "SCRIM_QUEUE_BAN_DURATION_MODIFIER",
    /**
     * The amount of time in days that previous queue bans are used in calculation duration modifiers.
     */
    SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS = "SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS",
    /**
     * The primary Discord guild of an organization.
     */
    PRIMARY_DISCORD_GUILD_SNOWFLAKE = "PRIMARY_DISCORD_GUILD_SNOWFLAKE",
    /**
      * Alterate guilds of the organization that names and roles will be synced to.
      */
    ALTERNATE_DISCORD_GUILD_SNOWFLAKES = "ALTERNATE_DISCORD_GUILD_SNOWFLAKES",
    /**
     * Disocrd Guuild Text Channel Id to post report cards to.
     */
    REPORT_CARD_CHANNEL_SNOWFLAKE = "REPORT_CARD_CHANNEL_SNOWFLAKE",
}

export enum OrganizationConfigurationKeyType {
    STRING = "STRING",
    INTEGER = "INTEGER",
    FLOAT = "FLOAT",
    ARRAY_STRING = "ARRAY_STRING",
}

export interface OrganizationConfigurationKeyTypes {
    [OrganizationConfigurationKeyType.STRING]: string;
    [OrganizationConfigurationKeyType.INTEGER]: number;
    [OrganizationConfigurationKeyType.FLOAT]: number;
    [OrganizationConfigurationKeyType.ARRAY_STRING]: string[];
}

registerEnumType(OrganizationConfigurationKeyType, {
    name: "OrganizationConfigurationKeyType",
});

registerEnumType(OrganizationConfigurationKeyCode, {
    name: "OrganizationConfigurationKeyCode",
});
