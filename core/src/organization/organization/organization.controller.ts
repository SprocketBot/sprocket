import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {
    GetGuildsByOrganizationIdResponse,
    GetOrganizationByDiscordGuildResponse,
    GetOrganizationDiscordGuildsByGuildResponse,
    GetTransactionsDiscordWebhookResponse,
} from "@sprocketbot/common";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {OrganizationConfigurationService} from "../../configuration/organization-configuration/organization-configuration.service";
import type {OrganizationProfile} from "../../database";
import {OrganizationConfigurationKeyCode} from "../../database";
import {OrganizationService} from "./organization.service";

@Controller("organization")
export class OrganizationController {
    constructor(
        private readonly organizationService: OrganizationService,
        private readonly organizationConfigurationService: OrganizationConfigurationService,
    ) {}

    @MessagePattern(CoreEndpoint.GetOrganizationProfile)
    async getOrganizationProfile(@Payload() payload: unknown): Promise<OrganizationProfile> {
        const data = CoreSchemas.GetOrganizationProfile.input.parse(payload);
        return this.organizationService.getOrganizationProfileForOrganization(data.id);
    }

    @MessagePattern(CoreEndpoint.GetOrganizationDiscordGuildsByGuild)
    async getOrganizationDiscordGuildsByGuild(
        @Payload() payload: unknown,
    ): Promise<GetOrganizationDiscordGuildsByGuildResponse> {
        const data = CoreSchemas.GetOrganizationDiscordGuildsByGuild.input.parse(payload);
        const valueContainingGuildId = await this.organizationConfigurationService.findOrganizationConfigurationValue(
            data.guildId,
            {relations: ["organization"]},
        );

        const primaryGuild = await this.organizationConfigurationService.getOrganizationConfigurationValue<string>(
            valueContainingGuildId.organization.id,
            OrganizationConfigurationKeyCode.PRIMARY_DISCORD_GUILD_SNOWFLAKE,
        );
        const alternateGuilds = await this.organizationConfigurationService.getOrganizationConfigurationValue<string[]>(
            valueContainingGuildId.organization.id,
            OrganizationConfigurationKeyCode.ALTERNATE_DISCORD_GUILD_SNOWFLAKES,
        );

        return {
            primary: primaryGuild,
            alternate: alternateGuilds,
        };
    }

    @MessagePattern(CoreEndpoint.GetOrganizationByDiscordGuild)
    async getOrganizationByDiscordGuild(@Payload() payload: unknown): Promise<GetOrganizationByDiscordGuildResponse> {
        const data = CoreSchemas.GetOrganizationDiscordGuildsByGuild.input.parse(payload);
        const valueContainingGuildId = await this.organizationConfigurationService.findOrganizationConfigurationValue(
            data.guildId,
            {relations: ["organization"]},
        );

        return {
            id: valueContainingGuildId.organization.id,
        };
    }

    @MessagePattern(CoreEndpoint.GetGuildsByOrganizationId)
    async getGuildsByOrganizationId(@Payload() payload: unknown): Promise<GetGuildsByOrganizationIdResponse> {
        const data = CoreSchemas.GetGuildsByOrganizationId.input.parse(payload);

        // Get primary if it exists
        let primary: string | null = null;
        try {
            primary = await this.organizationConfigurationService.getOrganizationConfigurationValue<string>(
                data.organizationId,
                OrganizationConfigurationKeyCode.PRIMARY_DISCORD_GUILD_SNOWFLAKE,
            );
            // eslint-disable-next-line no-empty
        } catch {}

        // Get alternates if they exist
        let alternates: string[] = [];
        try {
            alternates = await this.organizationConfigurationService.getOrganizationConfigurationValue<string[]>(
                data.organizationId,
                OrganizationConfigurationKeyCode.ALTERNATE_DISCORD_GUILD_SNOWFLAKES,
            );
            // eslint-disable-next-line no-empty
        } catch {}

        return {primary, alternates};
    }

    @MessagePattern(CoreEndpoint.GetTransactionsDiscordWebhook)
    async getTransactionsWebhook(@Payload() payload: unknown): Promise<GetTransactionsDiscordWebhookResponse> {
        const data = CoreSchemas.GetTransactionsDiscordWebhook.input.parse(payload);

        const webhook: string = await this.organizationConfigurationService.getOrganizationConfigurationValue<string>(
            data.organizationId,
            OrganizationConfigurationKeyCode.TRANSACTIONS_DISCORD_WEBHOOK_URL,
        );

        return {
            transactionsWebhook: webhook,
        };
    }
}
