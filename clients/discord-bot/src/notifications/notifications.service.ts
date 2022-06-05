import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import type {
    BrandingOptions, Embed, MessageContent,
} from "@sprocketbot/common";
import type {MessageOptions} from "discord.js";
import {Client} from "discord.js";

import {EmbedService} from "../embed";

@Injectable()
export class NotificationsService {
    private logger = new Logger(NotificationsService.name);
    
    constructor(
        @Inject("DISCORD_CLIENT") private readonly discordClient: Client,
        private readonly embedService: EmbedService,
    ) {}

    async sendGuildTextMessage(channelId: string, content: MessageContent, brandingOptions?: BrandingOptions): Promise<boolean> {
        try {
            const guildChannel = await this.discordClient.channels.fetch(channelId);
            if (!guildChannel?.isText()) return false;
            
            if (content.embeds?.length) {
                const newEmbeds: Embed[] = [];

                for (const embed of content.embeds) newEmbeds.push(await this.embedService.brandEmbed(
                    embed,
                    brandingOptions?.options,
                    brandingOptions?.organizationId,
                ) as Embed);
                content.embeds = newEmbeds;
            }

            await guildChannel.send(content as unknown as MessageOptions);
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
}
