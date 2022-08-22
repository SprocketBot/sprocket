import {Injectable, Logger} from "@nestjs/common";
import type {
    EventPayload,
    EventTopic,
    MatchReplaySubmission,
    ReplaySubmission,
    ScrimReplaySubmission,
} from "@sprocketbot/common";
import {
    BotEndpoint,
    BotService,
    ButtonComponentStyle,
    ComponentType,
    config,
    CoreEndpoint,
    CoreService,
    MatchmakingEndpoint,
    MatchmakingService,
    RedisService,
    ReplaySubmissionType,
    ResponseStatus,
} from "@sprocketbot/common";

@Injectable()
export class SubmissionService {
    private readonly logger = new Logger(SubmissionService.name);

    constructor(
        private readonly botService: BotService,
        private readonly coreService: CoreService,
        private readonly redisService: RedisService,
        private readonly matchmakingService: MatchmakingService,
    ) {}

    async sendSubmissionRatifyingNotifications(payload: EventPayload<EventTopic.SubmissionRatifying>): Promise<void> {
        const submission = await this.redisService.getJson<ReplaySubmission>(payload.redisKey);

        switch (submission.type) {
            case ReplaySubmissionType.MATCH:
                await this.sendMatchSubmissionRatifyingNotifications({...submission, id: payload.submissionId});
                break;
            case ReplaySubmissionType.SCRIM:
                await this.sendScrimSubmissionRatifyingNotifications(submission);
                break;
            default:
                this.logger.error("Submission type has not been implemented");
        }
    }

    async sendScrimSubmissionRatifyingNotifications(submission: ScrimReplaySubmission): Promise<void> {
        const scrimResult = await this.matchmakingService.send(MatchmakingEndpoint.GetScrim, submission.scrimId);
        if (scrimResult.status === ResponseStatus.ERROR) throw scrimResult.error;
        const scrim = scrimResult.data;
        
        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {id: scrim.organizationId});
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        await Promise.all(scrim.players.map(async p => {
            const userResult = await this.coreService.send(CoreEndpoint.GetDiscordIdByUser, p.id);
            if (userResult.status === ResponseStatus.ERROR || !userResult.data) return;

            await this.botService.send(BotEndpoint.SendDirectMessage, {
                userId: userResult.data,
                payload: {
                    embeds: [ {
                        title: "Your scrim is ready for ratification!",
                        description: `Hey, ${p.name}! The replays uploaded for your ${organizationBrandingResult.data.name} scrim have finished processing and are ready to be ratified. Verify they are correct and ratify them [here](${config.web.url}/scrims).`,
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
                                label: "Ratify here!",
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

    async sendMatchSubmissionRatifyingNotifications(submission: MatchReplaySubmission & {id: string;}): Promise<void> {
        const matchResult = await this.coreService.send(CoreEndpoint.GetMatchById, {matchId: submission.matchId});
        if (matchResult.status === ResponseStatus.ERROR) throw matchResult.error;

        const mleMatchResult = await this.coreService.send(CoreEndpoint.GetMleMatchInfoAndStakeholders, {sprocketMatchId: submission.matchId});
        if (mleMatchResult.status === ResponseStatus.ERROR) throw mleMatchResult.error;

        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {id: mleMatchResult.data.organizationId});
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        await Promise.all(mleMatchResult.data.stakeholderDiscordIds.map(async p => {
            await this.botService.send(BotEndpoint.SendDirectMessage, {
                userId: p,
                payload: {
                    embeds: [ {
                        title: "Your match is ready for ratification!",
                        description: `The replays uploaded for your ${organizationBrandingResult.data.name} match have finished processing and are ready to be ratified. Verify they are correct and ratify them [here](${config.web.url}/league/submit/${submission.id}).`,
                        author: {
                            name: `${organizationBrandingResult.data.name} Match Submission`,
                        },
                        fields: [
                            {
                                name: "Game Mode",
                                value: `${mleMatchResult.data.game} ${mleMatchResult.data.gameMode}`,
                            },
                            {
                                name: "Match",
                                value: `${mleMatchResult.data.skillGroup} ${matchResult.data.homeFranchise?.name} vs ${matchResult.data.awayFranchise?.name}`,
                            },
                        ],
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
                                label: "Ratify here!",
                                url: `${config.web.url}/league/submit/${submission.id}`,
                            },
                        ],
                    } ],
                },
                brandingOptions: {
                    organizationId: mleMatchResult.data.organizationId,
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

    async sendSubmissionRejectedNotifications(payload: EventPayload<EventTopic.SubmissionRejected>): Promise<void> {
        const submission = await this.redisService.getJson<ReplaySubmission>(payload.redisKey);

        switch (submission.type) {
            case ReplaySubmissionType.MATCH:
                await this.sendMatchSubmissionRejectedNotifications({...submission, id: payload.submissionId});
                break;
            case ReplaySubmissionType.SCRIM:
                await this.sendScrimSubmissionRejectedNotifications(submission);
                break;
            default:
                this.logger.error("Submission type has not been implemented");
        }
    }

    async sendScrimSubmissionRejectedNotifications(submission: ScrimReplaySubmission): Promise<void> {
        const scrimResult = await this.matchmakingService.send(MatchmakingEndpoint.GetScrim, submission.scrimId);
        if (scrimResult.status === ResponseStatus.ERROR) throw scrimResult.error;
        const scrim = scrimResult.data;
        
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
                        title: "Your scrim's replays have failed ratification!",
                        description: `Hey, ${p.name}! The replays uploaded for your ${organizationBrandingResult.data.name} scrim have been rejected. Please review the reason [here](${config.web.url}/scrims) and upload the correct replays if possible.`,
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
                                label: "Verify replays here!",
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

    async sendMatchSubmissionRejectedNotifications(submission: MatchReplaySubmission & {id: string;}): Promise<void> {
        const matchResult = await this.coreService.send(CoreEndpoint.GetMatchById, {matchId: submission.matchId});
        if (matchResult.status === ResponseStatus.ERROR) throw matchResult.error;

        const mleMatchResult = await this.coreService.send(CoreEndpoint.GetMleMatchInfoAndStakeholders, {sprocketMatchId: submission.matchId});
        if (mleMatchResult.status === ResponseStatus.ERROR) throw mleMatchResult.error;

        const organizationBrandingResult = await this.coreService.send(CoreEndpoint.GetOrganizationProfile, {id: mleMatchResult.data.organizationId});
        if (organizationBrandingResult.status === ResponseStatus.ERROR) throw organizationBrandingResult.error;

        await Promise.all(mleMatchResult.data.stakeholderDiscordIds.map(async p => {
            await this.botService.send(BotEndpoint.SendDirectMessage, {
                userId: p,
                payload: {
                    embeds: [ {
                        title: "Your match's submission has failed ratification!",
                        description: `The replays uploaded for your ${organizationBrandingResult.data.name} match have been rejected. Please review the reason [here](${config.web.url}/league/submit/${submission.id}) and upload the correct replays if possible.`,
                        author: {
                            name: `${organizationBrandingResult.data.name} Match Submission`,
                        },
                        fields: [
                            {
                                name: "Game Mode",
                                value: `${mleMatchResult.data.game} ${mleMatchResult.data.gameMode}`,
                            },
                            {
                                name: "Match",
                                value: `${mleMatchResult.data.skillGroup} ${matchResult.data.homeFranchise?.name} vs ${matchResult.data.awayFranchise?.name}`,
                            },
                        ],
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
                                label: "Verify replays here!",
                                url: `${config.web.url}/league/submit/${submission.id}`,
                            },
                        ],
                    } ],
                },
                brandingOptions: {
                    organizationId: mleMatchResult.data.organizationId,
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
}
