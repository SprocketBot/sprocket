import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import type {
    Embed, MessageContent,
} from "@sprocketbot/common";
import type {
    MessageOptions, TextChannel,
} from "discord.js";
import {Client} from "discord.js";

import {EmbedService} from "../embed";

@Injectable()
export class NotificationsService {
    private logger = new Logger(NotificationsService.name);
    
    constructor(
        @Inject("DISCORD_CLIENT") private readonly discordClient: Client,
        private readonly embedService: EmbedService,
    ) {}

    async sendMessage(channelId: string, message: string): Promise<boolean> {
        const c = await this.discordClient.channels.fetch(channelId) as TextChannel;
        await c.send(message);

        return true;
    }

    async sendDirectMessage(organizationId: number, userId: string, content: MessageContent): Promise<boolean> {
        try {
            const user = await this.discordClient.users.fetch(userId);
            
            if (content.embeds?.length) {
                const newEmbeds: Embed[] = [];

                for (const embed of content.embeds) newEmbeds.push(await this.embedService.embed(embed, organizationId) as Embed);
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
