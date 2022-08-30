import {Injectable} from "@nestjs/common";
import {
    BotEndpoint,
    BotService,
    config,
    CoreEndpoint,
    CoreService,
    EventMarshal,
    EventsService,
    EventTopic,
    GenerateReportCardType,
    MatchDatabaseIds,
    ResponseStatus,
    SprocketEvent,
} from "@sprocketbot/common";

@Injectable()
export class MatchService extends EventMarshal {
    constructor(
        readonly eventsService: EventsService,
        private readonly botService: BotService,
        private readonly coreService: CoreService,
    ) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.MatchSaved)
    async sendReportCard(databaseIds: MatchDatabaseIds): Promise<void> {
        const matchResult = await this.coreService.send(CoreEndpoint.GetMatchById, {matchId: databaseIds.id});
        if (matchResult.status === ResponseStatus.ERROR) throw matchResult.error;

        const mleMatchResult = await this.coreService.send(CoreEndpoint.GetMleMatchInfoAndStakeholders, {sprocketMatchId: databaseIds.id});
        if (mleMatchResult.status === ResponseStatus.ERROR) throw mleMatchResult.error;

        const matchReportCardWebhooksResult = await this.coreService.send(CoreEndpoint.GetMatchReportCardWebhooks, {matchId: databaseIds.id});
        if (matchReportCardWebhooksResult.status !== ResponseStatus.SUCCESS) {
            this.logger.warn("Failed to fetch report card webhook url");
            throw matchReportCardWebhooksResult.error;
        }

        const reportCardResult = await this.coreService.send(CoreEndpoint.GenerateReportCard, {
            type: GenerateReportCardType.SERIES,
            mleSeriesId: databaseIds.legacyId,
        }, {timeout: 300000});
        if (reportCardResult.status !== ResponseStatus.SUCCESS) {
            this.logger.warn("Failed to generate report card");
            throw reportCardResult.error;
        }

        if (matchReportCardWebhooksResult.data.skillGroupWebhook) await this.botService.send(BotEndpoint.SendWebhookMessage, {
            webhookUrl: matchReportCardWebhooksResult.data.skillGroupWebhook,
            payload: {
                embeds: [ {
                    title: "Match Results",
                    image: {
                        url: "attachment://card.png",
                    },
                    fields: [
                        {
                            name: "Game Mode",
                            value: `${mleMatchResult.data.game} ${mleMatchResult.data.gameMode}`,
                        },
                        {
                            name: "League",
                            value: `${mleMatchResult.data.skillGroup}`,
                        },
                        {
                            name: "Teams",
                            value: `${matchResult.data.homeFranchise?.name} vs ${matchResult.data.awayFranchise?.name}`,
                        },
                    ],
                    timestamp: Date.now(),
                } ],
                attachments: [ {name: "card.png", url: `minio:${config.minio.bucketNames.image_generation}/${reportCardResult.data}.png`} ],
            },
            brandingOptions: {
                organizationId: matchReportCardWebhooksResult.data.organizationId,
                options: {
                    color: true,
                    footer: {
                        icon: true,
                        text: true,
                    },
                    webhookAvatar: true,
                    webhookUsername: true,
                },
            },
        });

        await Promise.all(matchReportCardWebhooksResult.data.franchiseWebhooks.map(async franchiseWebhook => this.botService.send(BotEndpoint.SendWebhookMessage, {
            webhookUrl: franchiseWebhook,
            payload: {
                embeds: [ {
                    title: "Match Results",
                    image: {
                        url: "attachment://card.png",
                    },
                    timestamp: Date.now(),
                } ],
                attachments: [ {name: "card.png", url: `minio:${config.minio.bucketNames.image_generation}/${reportCardResult.data}.png`} ],
            },
            brandingOptions: {
                organizationId: matchReportCardWebhooksResult.data.organizationId,
                options: {
                    color: true,
                    footer: {
                        icon: true,
                        text: true,
                    },
                    webhookAvatar: true,
                    webhookUsername: true,
                },
            },
        })));
    }
}
