import {Injectable} from "@nestjs/common";
import type {ScrimDatabaseIds} from "@sprocketbot/common";
import {
    BotEndpoint,
    BotService,
    ButtonComponentStyle,
    ComponentType,
    config,
    CoreEndpoint,
    CoreService,
    EventsService,
    EventTopic,
    GenerateReportCardType,
    MatchmakingEndpoint,
    MatchmakingService,
    ResponseStatus,
    Scrim,
    ScrimMode,
    SprocketEvent,
    SprocketEventMarshal,
} from "@sprocketbot/common";

@Injectable()
export class ScrimService extends SprocketEventMarshal {
    constructor(
        readonly eventsService: EventsService,
        private readonly botService: BotService,
        private readonly coreService: CoreService,
        private readonly matchmakingService: MatchmakingService,
    ) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.ScrimCreated)
    async sendScrimCreatedNotifications(scrim: Scrim): Promise<void> {
        if (!scrim.settings.competitive) return;

        const skillGroupWebhook = await this.coreService.send(CoreEndpoint.GetSkillGroupWebhooks, {skillGroupId: scrim.skillGroupId});
        if (skillGroupWebhook.status === ResponseStatus.ERROR) throw skillGroupWebhook.error;
        if (!skillGroupWebhook.data.scrim) return;

        const skillGroupProfile = await this.coreService.send(CoreEndpoint.GetGameSkillGroupProfile, {skillGroupId: scrim.skillGroupId});
        if (skillGroupProfile.status === ResponseStatus.ERROR) throw skillGroupProfile.error;
        
        await this.botService.send(BotEndpoint.SendWebhookMessage, {
            webhookUrl: skillGroupWebhook.data.scrim,
            payload: {
                content: skillGroupWebhook.data.scrimRole ? `<@&${skillGroupWebhook.data.scrimRole}>` : "",
                embeds: [ {
                    title: "Scrim Created",
                    description: `[Join here!](${config.web.url}/scrims)`,
                    thumbnail: skillGroupProfile.data.photo
                        ? {
                                url: skillGroupProfile.data.photo.url,
                            }
                        : undefined,
                    color: parseInt(skillGroupProfile.data.color.replace("#", ""), 16),
                    fields: [
                        {
                            name: "Game Mode",
                            value: scrim.gameMode.description,
                        },
                        {
                            name: "Type",
                            value: scrim.settings.mode === ScrimMode.ROUND_ROBIN ? "Round Robin" : "Teams",
                        },
                    ],
                } ],
            },
            brandingOptions: {
                organizationId: scrim.organizationId,
                options: {},
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimPopped)
    async sendQueuePoppedNotifications(scrim: Scrim): Promise<void> {
        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {id: scrim.organizationId});
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        await Promise.all(scrim.players.map(async p => {
            const userResult = await this.coreService.send(CoreEndpoint.GetDiscordIdByUser, p.id);
            if (userResult.status === ResponseStatus.ERROR) throw userResult.error;
            if (!userResult.data) return;

            await this.botService.send(BotEndpoint.SendDirectMessage, {
                userId: userResult.data,
                payload: {
                    embeds: [ {
                        title: "Your scrim has popped!",
                        description: `Hey, ${p.name}! Your ${organizationBrandingResult.data.name} scrim just popped. Check in [here](${config.web.url}/scrims) to avoid being queue banned.`,
                        author: {
                            name: `${organizationBrandingResult.data.name} Scrims`,
                        },
                        footer: {
                            text: organizationBrandingResult.data.name,
                        },
                        timestamp: Date.now(),
                    } ],
                    components: [ {
                        type: ComponentType.ACTION_ROW,
                        components: [
                            {
                                type: ComponentType.BUTTON,
                                style: ButtonComponentStyle.LINK,
                                label: "Check in here!",
                                url: `${config.web.url}/scrims`,
                            },
                        ],
                    } ],
                },
                brandingOptions: {
                    organizationId: scrim.organizationId,
                    options: {
                        author: {
                            icon: true,
                        },
                        color: true,
                        thumbnail: true,
                        footer: {
                            icon: true,
                        },
                    },
                },
            });
        }));
    }

    @SprocketEvent(EventTopic.ScrimStarted)
    async sendLobbyNotifications(scrim: Scrim): Promise<void> {
        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {id: scrim.organizationId});
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        if (!scrim.settings.lobby) return;

        await Promise.all(scrim.players.map(async p => {
            const userResult = await this.coreService.send(CoreEndpoint.GetDiscordIdByUser, p.id);
            if (userResult.status === ResponseStatus.ERROR) throw userResult.error;
            if (!userResult.data) return;

            await this.botService.send(BotEndpoint.SendDirectMessage, {
                userId: userResult.data,
                payload: {
                    embeds: [ {
                        title: "Your scrim is ready to be played!",
                        description: `Hey, ${p.name}! Everyone has checked into your ${organizationBrandingResult.data.name} scrim. Here is your scrim's lobby information.`,
                        author: {
                            name: `${organizationBrandingResult.data.name} Scrims`,
                        },
                        fields: [
                            {
                                name: "Name",
                                value: `\`${scrim.settings.lobby?.name}\``,
                            },
                            {
                                name: "Password",
                                value: `\`${scrim.settings.lobby?.password}\``,
                            },
                        ],
                        footer: {
                            text: organizationBrandingResult.data.name,
                        },
                        timestamp: Date.now(),
                    } ],
                },
                brandingOptions: {
                    organizationId: scrim.organizationId,
                    options: {
                        author: {
                            icon: true,
                        },
                        color: true,
                        thumbnail: true,
                        footer: {
                            icon: true,
                        },
                    },
                },
            });
        }));
    }

    @SprocketEvent(EventTopic.ScrimSaved)
    async sendReportCard(scrim: Scrim & {databaseIds: ScrimDatabaseIds;}): Promise<void> {
        const scrimReportCardWebhooksResult = await this.coreService.send(CoreEndpoint.GetScrimReportCardWebhooks, scrim);
        if (scrimReportCardWebhooksResult.status !== ResponseStatus.SUCCESS) {
            this.logger.warn("Failed to fetch report card webhook url");
            throw scrimReportCardWebhooksResult.error;
        }

        const reportCardResult = await this.coreService.send(CoreEndpoint.GenerateReportCard, {
            type: GenerateReportCardType.SCRIM,
            mleScrimId: scrim.databaseIds.legacyId,
        }, {timeout: 300000});
        if (reportCardResult.status !== ResponseStatus.SUCCESS) {
            this.logger.warn("Failed to generate report card");
            throw reportCardResult.error;
        }

        const discordUserIds = await Promise.all(scrim.players.map(async player => {
            const discordUserResult = await this.coreService.send(CoreEndpoint.GetDiscordIdByUser, player.id);
            if (discordUserResult.status !== ResponseStatus.SUCCESS) return undefined;

            return discordUserResult.data;
        }));
        
        if (scrimReportCardWebhooksResult.data.skillGroupWebhook) await this.botService.send(BotEndpoint.SendWebhookMessage, {
            webhookUrl: scrimReportCardWebhooksResult.data.skillGroupWebhook,
            payload: {
                content: discordUserIds.filter(u => u).map(u => `<@${u}>`)
                    .join(", "),
                embeds: [ {
                    title: "Scrim Results",
                    image: {
                        url: "attachment://card.png",
                    },
                    timestamp: Date.now(),
                } ],
                attachments: [ {name: "card.png", url: `minio:${config.minio.bucketNames.image_generation}/${reportCardResult.data}.png`} ],
            },
            brandingOptions: {
                organizationId: scrim.organizationId,
                options: {
                    color: true,
                    footer: {
                        icon: true,
                        text: true,
                    },
                },
            },
        });

        await Promise.all(scrimReportCardWebhooksResult.data.franchiseWebhooks.map(async franchiseWebhook => this.botService.send(BotEndpoint.SendWebhookMessage, {
            webhookUrl: franchiseWebhook,
            payload: {
                embeds: [ {
                    title: "Scrim Results",
                    image: {
                        url: "attachment://card.png",
                    },
                    timestamp: Date.now(),
                } ],
                attachments: [ {name: "card.png", url: `minio:${config.minio.bucketNames.image_generation}/${reportCardResult.data}.png`} ],
            },
            brandingOptions: {
                organizationId: scrim.organizationId,
                options: {
                    color: true,
                    footer: {
                        icon: true,
                        text: true,
                    },
                },
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
