import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import type {
    Attachment,
    BrandingOptions,
    Embed,
    MessageContent,
    WebhookMessageOptions,
} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreService,
    MinioService,
    ResponseStatus, SprocketConfigurationKey,
} from "@sprocketbot/common";
import type {
    MessageActionRow, MessageOptions,
} from "discord.js";
import {Client, MessageAttachment} from "discord.js";

import {EmbedService} from "../embed";

@Injectable()
export class NotificationsService {
    private logger = new Logger(NotificationsService.name);

    constructor(
        @Inject("DISCORD_CLIENT") private readonly discordClient: Client,
        private readonly embedService: EmbedService,
        private readonly minioService: MinioService,
        private readonly coreService: CoreService,
    ) {}

    /**
     * Attachments use either a url for an image or video or to use minio, the following format:
     * minio:bucket_name/object_key
     * @example
     * // Minio File
     * downloadAttachment("minio:bucket_name/object_key")
     * // External File
     * downloadAttachment("https://cdn.discordapp.com/icons/222078108977594368/6e1019b3179d71046e463a75915e7244.png?size=2048")
     */
    async downloadAttachment(attachment: Attachment | string): Promise<MessageAttachment> {
        const url = typeof attachment === "string" ? attachment : attachment.url;
        const name = typeof attachment === "string" ? undefined : attachment.name;

        if (url.startsWith("minio:")) {
            const [bucket, ...objPath] = url.split(":")[1].split("/");
            const objectPath = objPath.join("/");
            const file = await this.minioService.get(bucket, objectPath);

            return new MessageAttachment(file, name);
        }

        return new MessageAttachment(url, name);
    }

    async sendGuildTextMessage(channelId: string, content: MessageContent, brandingOptions?: BrandingOptions): Promise<boolean> {
        try {
            const guildChannel = await this.discordClient.channels.fetch(channelId);
            if (!guildChannel?.isText()) return false;

            const messageOptions: MessageOptions = {
                content: content.content,
                components: content.components as unknown as MessageActionRow[],
            };

            if (content.embeds?.length) {
                const newEmbeds: Embed[] = [];

                for (const embed of content.embeds) newEmbeds.push(await this.embedService.brandEmbed(
                    embed,
                    brandingOptions?.options,
                    brandingOptions?.organizationId,
                ) as Embed);
                messageOptions.embeds = newEmbeds;
            }

            if (content.attachments?.length) {
                const newAttachments = await Promise.all(content.attachments.map(async a => this.downloadAttachment(a)));
                messageOptions.files = newAttachments;
            }

            await guildChannel.send(messageOptions);
        } catch (e) {
            this.logger.error(e);
            return false;
        }

        return true;
    }

    async sendDirectMessage(userId: string, content: MessageContent, brandingOptions?: BrandingOptions): Promise<boolean> {
        // First check if we are allowed to send DMs
        const r = await this.coreService.send(CoreEndpoint.GetSprocketConfiguration, {key: SprocketConfigurationKey.DISABLE_DISCORD_DMS});
        if (r.status === ResponseStatus.ERROR) throw r.error;
        if (r.data[0].value === "true") return false;

        try {
            const user = await this.discordClient.users.fetch(userId);

            if (content.embeds?.length) {
                const newEmbeds: Embed[] = [];

                for (const embed of content.embeds) newEmbeds.push(await this.embedService.brandEmbed(
                    embed,
                    brandingOptions?.options,
                    brandingOptions?.organizationId,
                ) as Embed);
                content.embeds = newEmbeds;
            }

            await user.send(content as unknown as MessageOptions);
        } catch (e) {
            this.logger.error(e);
            return false;
        }

        return true;
    }

    async sendWebhookMessage(webhookUrl: string, content: MessageContent & WebhookMessageOptions, brandingOptions?: BrandingOptions): Promise<boolean> {
        try {
            const webhookMatch = webhookUrl.match(/^https:\/\/discord\.com\/api\/webhooks\/(\d+)\/(.+)$/);
            if (!webhookMatch) return false;

            const [, id, token] = webhookMatch;
            const webhook = await this.discordClient.fetchWebhook(id, token);

            const messageOptions: MessageOptions & WebhookMessageOptions = {
                content: content.content,
                components: content.components as unknown as MessageActionRow[],
                username: content.username,
                avatarURL: content.avatarURL,
            };

            if (brandingOptions?.organizationId && (brandingOptions.options.webhookAvatar || brandingOptions.options.webhookUsername)) {
                const organizationProfileResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {id: brandingOptions.organizationId});
                if (organizationProfileResult.status === ResponseStatus.ERROR) throw organizationProfileResult.error;

                if (brandingOptions.options.webhookUsername) messageOptions.username = organizationProfileResult.data.name;
                if (brandingOptions.options.webhookAvatar && organizationProfileResult.data.logoUrl) messageOptions.avatarURL = organizationProfileResult.data.logoUrl;
            }

            if (content.embeds?.length) {
                const newEmbeds: Embed[] = [];

                for (const embed of content.embeds) newEmbeds.push(await this.embedService.brandEmbed(
                    embed,
                    brandingOptions?.options,
                    brandingOptions?.organizationId,
                ) as Embed);
                messageOptions.embeds = newEmbeds;
            }

            if (content.attachments?.length) {
                const newAttachments = await Promise.all(content.attachments.map(async a => this.downloadAttachment(a)));
                messageOptions.files = newAttachments;
            }

            await webhook.send(messageOptions);
        } catch (e) {
            this.logger.error(e);
            return false;
        }

        return true;
    }
}
