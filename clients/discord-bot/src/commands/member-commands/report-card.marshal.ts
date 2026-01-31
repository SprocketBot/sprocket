import {Inject, Logger} from "@nestjs/common";
import {
    AnalyticsService,
    config,
    CoreEndpoint,
    CoreService,
    GenerateReportCardType,
    ResponseStatus,
} from "@sprocketbot/common";
import type {MessageOptions} from "discord.js";
import {Client, Message} from "discord.js";

import {EmbedService} from "../../embed";
import {
    Command, CommandManagerService, Marshal, MarshalCommandContext,
} from "../../marshal";
import {NotificationsService} from "../../notifications";

export class ReportCardMarshal extends Marshal {
    private readonly logger = new Logger(ReportCardMarshal.name);

    constructor(
        protected readonly cms: CommandManagerService,
        protected readonly coreService: CoreService,
        protected readonly analyticsService: AnalyticsService,
        protected readonly embedService: EmbedService,
        @Inject("DISCORD_CLIENT") protected readonly botClient: Client,
        private readonly notificationsService: NotificationsService,
    ) {
        super(cms, coreService, analyticsService, embedService, botClient);
    }

    @Command({
        name: "reportCard",
        docs: "Generates a report card for the member's latest scrim.",
        aliases: ["rc"],
        args: [],
    })
    async reportCard(m: Message, c: MarshalCommandContext): Promise<void> {
        if (!m.guild || !c.author) return;

        const organizationResult = await this.coreService.send(
            CoreEndpoint.GetOrganizationByDiscordGuild,
            {
                guildId: m.guild.id,
            },
        );
        if (organizationResult.status === ResponseStatus.ERROR) {
            this.logger.error(organizationResult.error);
            await m.reply("Couldn't resolve organization.");
            return;
        }

        const scrimResult = await this.coreService.send(CoreEndpoint.GetUsersLatestScrim, {
            userId: c.author.id,
            organizationId: organizationResult.data.id,
        });
        if (scrimResult.status === ResponseStatus.ERROR) {
            this.logger.error(scrimResult.error);
            await m.reply("Couldn't find a scrim for you.");
            return;
        }

        const reportCardResult = await this.coreService.send(
            CoreEndpoint.GenerateReportCard,
            {
                type: GenerateReportCardType.SCRIM,
                mleScrimId: scrimResult.data.id,
            },
            {timeout: 300000},
        );
        if (reportCardResult.status === ResponseStatus.ERROR) {
            this.logger.error(reportCardResult.error);
            await m.reply("Couldn't generate report card.");
            return;
        }

        const embed = await this.embedService.brandEmbed(
            {
                title: "Scrim Results",
                image: {
                    url: "attachment://card.png",
                },
                timestamp: Date.now(),
            },
            {
                color: true,
                footer: {
                    icon: true,
                    text: true,
                },
            },
            organizationResult.data.id,
        );
        const messageAttachment = await this.notificationsService.downloadAttachment({
            name: "card.png",
            url: `minio:${config.minio.bucketNames.image_generation}/${reportCardResult.data}.png`,
        });
        const messageContent: MessageOptions = {
            embeds: [embed],
            files: [messageAttachment],
        };

        await m.reply(messageContent);
    }
}
