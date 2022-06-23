import {Injectable} from "@nestjs/common";
import type {Embed, EmbedBrandingOptions} from "@sprocketbot/common";
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

    async brandEmbed(data: Embed, options: EmbedBrandingOptions = {}, _organizationId?: number): Promise<MessageEmbed> {
        let organizationId = 1;

        if (_organizationId !== undefined) {
            // TODO check if this organization has branding enabled
            const brandingEnabled = true;

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (brandingEnabled) organizationId = _organizationId;
        }

        const organizationProfileResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {id: organizationId});
        if (organizationProfileResult.status === ResponseStatus.ERROR) throw organizationProfileResult.error;

        const profile = organizationProfileResult.data;
        const embed = new MessageEmbed(data);

        if (options.author) embed.setAuthor(
            data.author?.name ?? profile.name,
            options.author.icon && profile.logoUrl ? profile.logoUrl : data.author?.url,
            options.author.url ? profile.websiteUrl : data.author?.url,
        );
        if (options.color) embed.setColor(profile.primaryColor as HexColorString);
        if (options.footer) embed.setFooter(
            data.footer?.text ?? profile.name,
            options.footer.icon && profile.logoUrl ? profile.logoUrl : data.footer?.icon_url,
        );
        if (options.thumbnail && profile.logoUrl) embed.setThumbnail(profile.logoUrl);

        return embed;
    }

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

        const response = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {id: orgId});
        if (response.status === ResponseStatus.ERROR) throw response.error;
        const profile = response.data;
        // TODO what should our overall embed system look like, and what should the defaults be?
        const defaults: Partial<MessageEmbedOptions> = {
            footer: {
                text: "Footer",
                iconURL: profile.logoUrl ?? "",
            },
            author: {
                name: "Author",
                url: profile.websiteUrl,
                iconURL: profile.logoUrl ?? "",
            },
        };

        const branding: Partial<MessageEmbedOptions> = {
            color: profile.primaryColor as HexColorString,
            thumbnail: {url: profile.logoUrl ?? ""},
        };

        return new MessageEmbed({
            ...defaults,
            ...options,
            ...branding,
        });
    }
}
