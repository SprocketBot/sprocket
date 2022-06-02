import {Injectable, Logger} from "@nestjs/common";
import {BotEndpoint, BotService} from "@sprocketbot/common";

@Injectable()
export class ScrimService {
    private readonly logger = new Logger(ScrimService.name);

    constructor(private readonly botService: BotService) {}

    async sendScrimNotification(): Promise<void> {
        await this.botService.send(BotEndpoint.SendMessageToGuildTextChannel, {channelId: "856290331656847378", message: "Hey, loser <@112140878637707264>. A scrim was created."});
    }
}
