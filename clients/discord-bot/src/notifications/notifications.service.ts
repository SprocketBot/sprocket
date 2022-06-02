import {Inject, Injectable} from "@nestjs/common";
import type {TextChannel} from "discord.js";
import {Client} from "discord.js";

@Injectable()
export class NotificationsService {
    constructor(@Inject("DISCORD_CLIENT") private readonly discordClient: Client) {}

    async sendMessage(channelId: string, message: string): Promise<boolean> {
        const c = await this.discordClient.channels.fetch(channelId) as TextChannel;
        await c.send(message);

        return true;
    }
}
