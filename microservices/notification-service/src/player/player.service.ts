import {Injectable} from "@nestjs/common";
import {
    BotEndpoint,
    BotService,
    CoreEndpoint,
    CoreService,
    EventsService,
    EventTopic,
    PlayerSkillGroupChangedType,
    ResponseStatus,
    SprocketEvent,
    SprocketEventMarshal,
} from "@sprocketbot/common";

@Injectable()
export class PlayerService extends SprocketEventMarshal {
    constructor(
        readonly eventsService: EventsService,
        private readonly botService: BotService,
        private readonly coreService: CoreService,
    ) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.PlayerSkillGroupChanged)
    async sendSkillGroupChanged(sgChangedPayload: PlayerSkillGroupChangedType): Promise<void> {
        const transactionsWebhooksResult = await this.coreService.send(
            CoreEndpoint.GetTransactionsDiscordWebhook,
            {organizationId: sgChangedPayload.organizationId},
        );
        if (transactionsWebhooksResult.status !== ResponseStatus.SUCCESS) {
            this.logger.warn("Failed to fetch report card webhook url");
            throw transactionsWebhooksResult.error;
        }
        if (transactionsWebhooksResult.data.transactionsWebhook) await this.botService.send(BotEndpoint.SendWebhookMessage, {
            webhookUrl: transactionsWebhooksResult.data.transactionsWebhook,
            payload: {
                content: `${sgChangedPayload.old.discordEmojiId} ${sgChangedPayload.new.discordEmojiId} <@${sgChangedPayload.discordId}> has moved from ${sgChangedPayload.old.discordEmojiId} to ${sgChangedPayload.new.discordEmojiId}`,
            },
        });
    }
}
