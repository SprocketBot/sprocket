import {Injectable} from "@nestjs/common";
import {
    CoreEndpoint, CoreService, ResponseStatus,
} from "@sprocketbot/common";
import type {
    EmbedFieldData, HexColorString, MessageEmbedFooter, MessageEmbedOptions,
} from "discord.js";
import {MessageEmbed} from "discord.js";

export interface EmbedOptions {
    title?: string;
    description?: string;
    fields?: EmbedFieldData[];
    footer?: MessageEmbedFooter;
}

@Injectable()
export class EmbedService {
    constructor(private readonly coreService: CoreService) {}

    /**
     * Creates an organization branded embed if the organization has branding enabled. Otherwise uses Sprocket branding.
     * @param organizationId The organization to use to generate the branded embed.
     * @param options Configuration for the embed.
     * @returns The MessageEmbed.
     */
    async embed(options: EmbedOptions, organizationId?: number): Promise<MessageEmbed> {
        let orgId = 1; // Default to using Sprocket

        if (organizationId !== undefined) {
            // TODO check if this organization has branding enabled
            const brandingEnabled = true;

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (brandingEnabled) {
                orgId = organizationId;
            }
        }

        const response = await this.coreService.send(CoreEndpoint.GetOrganizationBranding, {id: orgId});
        if (response.status === ResponseStatus.ERROR) throw response.error;
        const profile = response.data;
        // TODO what should our overall embed system look like, and what should the defaults be?
        const defaults: Partial<MessageEmbedOptions> = {
            footer: {
                text: "Footer",
                iconURL: profile.logoUrl,
            },
            author: {
                name: "Author",
                url: profile.websiteUrl,
                iconURL: profile.logoUrl,
            },
        };

        const branding: Partial<MessageEmbedOptions> = {
            color: profile.primaryColor as HexColorString,
            thumbnail: {url: profile.logoUrl},
        };

        return new MessageEmbed({
            ...defaults,
            ...options,
            ...branding,
        });
    }
}
