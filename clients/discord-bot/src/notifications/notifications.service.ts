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
    ResponseStatus,
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
                const brandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationBranding, {id: brandingOptions.organizationId});
                if (brandingResult.status === ResponseStatus.ERROR) throw brandingResult.error;

                if (brandingOptions.options.webhookUsername) messageOptions.username = brandingResult.data.name;
                if (brandingOptions.options.webhookAvatar) messageOptions.avatarURL = brandingResult.data.logoUrl;
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
