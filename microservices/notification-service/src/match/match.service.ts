import {Injectable, Logger} from "@nestjs/common";
import type {MatchDatabaseIds} from "@sprocketbot/common";
import {
    BotEndpoint, BotService, config, CoreEndpoint, CoreService, GenerateReportCardType, ResponseStatus,
} from "@sprocketbot/common";

@Injectable()
export class MatchService {
    private readonly logger = new Logger(MatchService.name);

    constructor(
        private readonly botService: BotService,
        private readonly coreService: CoreService,
    ) {}

    async sendReportCard(databaseIds: MatchDatabaseIds): Promise<void> {
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
