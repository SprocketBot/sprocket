import {Injectable, Logger} from "@nestjs/common";
import type {Scrim} from "@sprocketbot/common";
import {
    BotEndpoint, BotService, GqlService, MatchmakingEndpoint, MatchmakingService, ResponseStatus,
} from "@sprocketbot/common";

@Injectable()
export class ScrimService {
    private readonly logger = new Logger(ScrimService.name);

    constructor(
        private readonly botService: BotService,
        private readonly matchmakingService: MatchmakingService,
        private readonly gqlService: GqlService,
    ) {}

    async sendNotifications(scrim: Scrim): Promise<void> {
        await Promise.all(scrim.players.map(async p => this.botService.send(BotEndpoint.SendDirectMessage, {
            userId: "105408136285818880",
            content: {
                embeds: [ {
                    title: "Scrim popped!",
                    description: `Hey there, ${p.name}! Your scrim popped! Go check in!`,
                } ],
            },
        })));
    }

    async getScrim(scrimId: string): Promise<Scrim | null> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrim, scrimId);
        if (result.status === ResponseStatus.SUCCESS) {
            return result.data;
        }
        throw result.error;
    }
}
