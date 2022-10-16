import {Injectable} from "@nestjs/common";
import type {MatchReplaySubmission, ReplaySubmission, ScrimReplaySubmission} from "@sprocketbot/common";
import {
    BotEndpoint,
    BotService,
    ButtonComponentStyle,
    ComponentType,
    config,
    CoreEndpoint,
    CoreService,
    EventPayload,
    EventsService,
    EventTopic,
    MatchmakingEndpoint,
    MatchmakingService,
    RedisService,
    ReplaySubmissionType,
    ResponseStatus,
    SprocketEvent,
    SprocketEventMarshal,
} from "@sprocketbot/common";

@Injectable()
export class SubmissionService extends SprocketEventMarshal {
    constructor(
        readonly eventsService: EventsService,
        private readonly botService: BotService,
        private readonly coreService: CoreService,
        private readonly redisService: RedisService,
        private readonly matchmakingService: MatchmakingService,
    ) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.SubmissionRatifying)
    async sendSubmissionRatifyingNotifications(payload: EventPayload<EventTopic.SubmissionRatifying>): Promise<void> {
        const submission = await this.redisService.getJson<ReplaySubmission>(payload.redisKey);

        switch (submission.type) {
            case ReplaySubmissionType.MATCH:
                await this.sendMatchSubmissionRatifyingNotifications({
                    ...submission,
                    id: payload.submissionId,
                });
                break;
            case ReplaySubmissionType.SCRIM:
                await this.sendScrimSubmissionRatifyingNotifications(submission);
                break;
            default:
                this.logger.error("Submission type has not been implemented");
        }
    }

    @SprocketEvent(EventTopic.SubmissionRejected)
    async sendSubmissionRejectedNotifications(payload: EventPayload<EventTopic.SubmissionRejected>): Promise<void> {
        const submission = await this.redisService.getJson<ReplaySubmission>(payload.redisKey);

        switch (submission.type) {
            case ReplaySubmissionType.MATCH:
                await this.sendMatchSubmissionRejectedNotifications({
                    ...submission,
                    id: payload.submissionId,
                });
                break;
            case ReplaySubmissionType.SCRIM:
                await this.sendScrimSubmissionRejectedNotifications(submission);
                break;
            default:
                this.logger.error("Submission type has not been implemented");
        }
    }

    async sendScrimSubmissionRatifyingNotifications(submission: ScrimReplaySubmission): Promise<void> {
        const scrimResult = await this.matchmakingService.send(MatchmakingEndpoint.GetScrim, submission.scrimId);
        if (scrimResult.status === ResponseStatus.ERROR) throw scrimResult.error;

        const scrim = scrimResult.data;
        if (!scrim) throw new Error("Scrim does not exist");

        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {
            id: scrim.organizationId,
        });
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {
            id: scrim.organizationId,
        });
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        await Promise.all(
            scrim.players.map(async p => {
                const userResult = await this.coreService.send(CoreEndpoint.GetDiscordIdByUser, p.id);
                if (userResult.status === ResponseStatus.ERROR || !userResult.data) return;

                await this.botService.send(BotEndpoint.SendDirectMessage, {
                    userId: userResult.data,
                    payload: {
                        embeds: [
                            {
                                title: "Your scrim is ready for ratification!",
                                description: `Hey, ${p.name}! The replays uploaded for your ${organizationBrandingResult.data.name} scrim have finished processing and are ready to be ratified. Verify they are correct and ratify them [here](${config.web.url}/scrims).`,
                                author: {
                                    name: `${organizationBrandingResult.data.name} Scrims`,
                                },
                                footer: {
                                    text: organizationBrandingResult.data.name,
                                },
                                timestamp: Date.now(),
                            },
                        ],
                        components: [
                            {
                                type: ComponentType.ACTION_ROW,
                                components: [
                                    {
                                        type: ComponentType.BUTTON,
                                        style: ButtonComponentStyle.LINK,
                                        label: "Ratify here!",
                                        url: `${config.web.url}/scrims`,
                                    },
                                ],
                            },
                        ],
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
            }),
        );
    }

    async sendMatchSubmissionRatifyingNotifications(submission: MatchReplaySubmission): Promise<void> {
        const matchResult = await this.coreService.send(CoreEndpoint.GetMatchById, {matchId: submission.matchId});
        if (matchResult.status === ResponseStatus.ERROR) throw matchResult.error;

        const infoResult = await this.coreService.send(CoreEndpoint.GetMatchInformationAndStakeholders, {
            matchId: submission.matchId,
        });
        if (infoResult.status === ResponseStatus.ERROR) throw infoResult.error;

        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {
            id: infoResult.data.organizationId,
        });
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        const webhooks: Array<{url: string; role?: string}> = [];
        if (infoResult.data.home.url) webhooks.push(infoResult.data.home as {url: string; role?: string});
        if (infoResult.data.away.url) webhooks.push(infoResult.data.away as {url: string; role?: string});

        await Promise.all(
            webhooks.map(async w => {
                await this.botService.send(BotEndpoint.SendWebhookMessage, {
                    webhookUrl: w.url,
                    payload: {
                        content: w.role ? `<@&${w.role}>` : undefined,
                        embeds: [
                            {
                                title: "Your match is ready for ratification!",
                                description: `The replays uploaded for your ${organizationBrandingResult.data.name} match have finished processing and are ready to be ratified. Verify they are correct and ratify them [here](${config.web.url}/league/submit/${submission.id}).`,
                                author: {
                                    name: `${organizationBrandingResult.data.name} Match Submission`,
                                },
                                fields: [
                                    {
                                        name: "Game Mode",
                                        value: `${infoResult.data.game} ${infoResult.data.gameMode}`,
                                    },
                                    {
                                        name: "League",
                                        value: `${infoResult.data.skillGroup}`,
                                    },
                                    {
                                        name: "Teams",
                                        value: `${matchResult.data.homeFranchise?.name} vs ${matchResult.data.awayFranchise?.name}`,
                                    },
                                ],
                                footer: {
                                    text: organizationBrandingResult.data.name,
                                },
                                timestamp: Date.now(),
                            },
                        ],
                        components: [
                            {
                                type: ComponentType.ACTION_ROW,
                                components: [
                                    {
                                        type: ComponentType.BUTTON,
                                        style: ButtonComponentStyle.LINK,
                                        label: "Ratify here!",
                                        url: `${config.web.url}/league/submit/${submission.id}`,
                                    },
                                ],
                            },
                        ],
                    },
                    brandingOptions: {
                        organizationId: infoResult.data.organizationId,
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
            }),
        );
    }

    async sendScrimSubmissionRejectedNotifications(submission: ScrimReplaySubmission): Promise<void> {
        const scrimResult = await this.matchmakingService.send(MatchmakingEndpoint.GetScrim, submission.scrimId);
        if (scrimResult.status === ResponseStatus.ERROR) throw scrimResult.error;

        const scrim = scrimResult.data;
        if (!scrim) throw new Error("Scrim does not exist");

        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {
            id: scrim.organizationId,
        });
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {
            id: scrim.organizationId,
        });
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        await Promise.all(
            scrim.players.map(async p => {
                const userResult = await this.coreService.send(CoreEndpoint.GetDiscordIdByUser, p.id);
                if (userResult.status === ResponseStatus.ERROR) throw userResult.error;
                if (!userResult.data) return;

                await this.botService.send(BotEndpoint.SendDirectMessage, {
                    userId: userResult.data,
                    payload: {
                        embeds: [
                            {
                                title: "Your scrim's replays have failed ratification!",
                                description: `Hey, ${p.name}! The replays uploaded for your ${organizationBrandingResult.data.name} scrim have been rejected. Please review the reason [here](${config.web.url}/scrims) and upload the correct replays if possible.`,
                                author: {
                                    name: `${organizationBrandingResult.data.name} Scrims`,
                                },
                                footer: {
                                    text: organizationBrandingResult.data.name,
                                },
                                timestamp: Date.now(),
                            },
                        ],
                        components: [
                            {
                                type: ComponentType.ACTION_ROW,
                                components: [
                                    {
                                        type: ComponentType.BUTTON,
                                        style: ButtonComponentStyle.LINK,
                                        label: "Verify replays here!",
                                        url: `${config.web.url}/scrims`,
                                    },
                                ],
                            },
                        ],
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
            }),
        );
    }

    async sendMatchSubmissionRejectedNotifications(submission: MatchReplaySubmission & {id: string}): Promise<void> {
        const matchResult = await this.coreService.send(CoreEndpoint.GetMatchById, {matchId: submission.matchId});
        if (matchResult.status === ResponseStatus.ERROR) throw matchResult.error;

        const infoResult = await this.coreService.send(CoreEndpoint.GetMatchInformationAndStakeholders, {
            matchId: submission.matchId,
        });
        if (infoResult.status === ResponseStatus.ERROR) throw infoResult.error;

        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {
            id: infoResult.data.organizationId,
        });
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        const webhooks: Array<{url: string; role?: string}> = [];
        if (infoResult.data.home.url) webhooks.push(infoResult.data.home as {url: string; role?: string});
        if (infoResult.data.away.url) webhooks.push(infoResult.data.away as {url: string; role?: string});

        await Promise.all(
            webhooks.map(async w => {
                await this.botService.send(BotEndpoint.SendWebhookMessage, {
                    webhookUrl: w.url,
                    payload: {
                        content: w.role ? `<@&${w.role}>` : undefined,
                        embeds: [
                            {
                                title: "Your match's submission has failed ratification!",
                                description: `The replays uploaded for your ${organizationBrandingResult.data.name} match have been rejected. Please review the reason [here](${config.web.url}/league/submit/${submission.id}) and upload the correct replays if possible.`,
                                author: {
                                    name: `${organizationBrandingResult.data.name} Match Submission`,
                                },
                                fields: [
                                    {
                                        name: "Game Mode",
                                        value: `${infoResult.data.game} ${infoResult.data.gameMode}`,
                                    },
                                    {
                                        name: "League",
                                        value: `${infoResult.data.skillGroup}`,
                                    },
                                    {
                                        name: "Teams",
                                        value: `${matchResult.data.homeFranchise?.name} vs ${matchResult.data.awayFranchise?.name}`,
                                    },
                                ],
                                footer: {
                                    text: organizationBrandingResult.data.name,
                                },
                                timestamp: Date.now(),
                            },
                        ],
                        components: [
                            {
                                type: ComponentType.ACTION_ROW,
                                components: [
                                    {
                                        type: ComponentType.BUTTON,
                                        style: ButtonComponentStyle.LINK,
                                        label: "Verify replays here!",
                                        url: `${config.web.url}/league/submit/${submission.id}`,
                                    },
                                ],
                            },
                        ],
                    },
                    brandingOptions: {
                        organizationId: infoResult.data.organizationId,
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
            }),
        );
    }
}
