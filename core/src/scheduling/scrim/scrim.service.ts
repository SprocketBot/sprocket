import {Inject, Injectable, Logger} from "@nestjs/common";
import type {
    CoreEndpoint,
    CoreInput,
    CoreOutput,
    CreateScrimOptions,
    JoinScrimOptions,
    Scrim as IScrim,
    ScrimMetrics as IScrimMetrics,
} from "@sprocketbot/common";
import {
    EventsService,
    EventTopic,
    MatchmakingEndpoint,
    MatchmakingService,
    ResponseStatus,
    ScrimStatus,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {IsNull, Not} from "typeorm";

import {FranchiseProfiledRepository} from "../../franchise/database/franchise.repository";
import {GameSkillGroupProfiledRepository} from "../../franchise/database/game-skill-group.repository";
import {FranchiseService} from "../../franchise/franchise.service";
import {PubSubKey} from "../../types/pubsub.constants";
import {PlayerStatLineRepository} from "../database/player-stat-line.repository";
import type {Scrim} from "../graphql/Scrim.object";

@Injectable()
export class ScrimService {
    private readonly logger = new Logger(ScrimService.name);

    private subscribed = false;

    constructor(
        @Inject(PubSubKey.Scrims) private readonly pubsub: PubSub,
        private readonly matchmakingService: MatchmakingService,
        private readonly eventsService: EventsService,
        private readonly skillGroupProfiledRepository: GameSkillGroupProfiledRepository,
        private readonly franchiseService: FranchiseService,
        private readonly franchiseProfiledRepository: FranchiseProfiledRepository,
        private readonly playerStatLineRepository: PlayerStatLineRepository,
    ) {}

    get metricsSubTopic(): string {
        return "metrics.update";
    }

    get pendingScrimsSubTopic(): string {
        return "scrims.created";
    }

    get allActiveScrimsSubTopic(): string {
        return "scrims.updated";
    }

    async getAllScrims(organizationId?: number, skillGroupIds?: number[]): Promise<IScrim[]> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetAllScrims, {
            organizationId,
            skillGroupIds,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async getScrimMetrics(): Promise<IScrimMetrics> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimMetrics, {});

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async getScrimByPlayer(userId: number): Promise<IScrim | null> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimByPlayer, {userId});
        if (result.status === ResponseStatus.SUCCESS) {
            return result.data;
        }
        throw result.error;
    }

    async getScrimBySubmissionId(submissionId: string): Promise<IScrim | null> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, {submissionId});
        if (result.status === ResponseStatus.SUCCESS) {
            return result.data;
        }
        throw result.error;
    }

    async getScrimById(scrimId: string): Promise<IScrim | null> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrim, {scrimId});
        if (result.status === ResponseStatus.SUCCESS) {
            return result.data;
        }
        throw result.error;
    }

    async createScrim(data: CreateScrimOptions): Promise<IScrim> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.CreateScrim, data);

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async joinScrim(data: JoinScrimOptions): Promise<boolean> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.JoinScrim, data);

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async leaveScrim(userId: number, scrimId: string): Promise<boolean> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.LeaveScrim, {
            userId: userId,
            scrimId: scrimId,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async checkIn(userId: number, scrimId: string): Promise<boolean> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.CheckInToScrim, {userId, scrimId});

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async cancelScrim(scrimId: string): Promise<IScrim> {
        this.logger.log(`cancelScrim scrimId=${scrimId}`);
        const result = await this.matchmakingService.send(MatchmakingEndpoint.CancelScrim, {
            scrimId,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async setScrimLocked(scrimId: string, locked: boolean, reason?: string): Promise<boolean> {
        this.logger.log(`lockScrim scrimId=${scrimId} locked=${locked}`);
        const result = await this.matchmakingService.send(MatchmakingEndpoint.SetScrimLocked, {
            scrimId,
            locked,
            reason,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async getLatestScrimIdByUserId(userId: number, organizationId: number): Promise<number> {
        const psl = await this.playerStatLineRepository.findOneOrFail({
            where: {
                player: {
                    member: {
                        user: {
                            id: userId,
                        },
                        organization: {
                            id: organizationId,
                        },
                    },
                },
                round: {
                    match: {
                        matchParent: {
                            scrimMeta: Not(IsNull()),
                        },
                    },
                },
            },
            order: {id: "DESC"},
            relations: {player: {member: {user: true}}, round: {match: {matchParent: {scrimMeta: true}}}},
        });
        return psl.round.match.matchParent.scrimMeta!.id;
    }

    async getRelevantWebhooks(
        scrim: CoreInput<CoreEndpoint.GetScrimReportCardWebhooks>,
    ): Promise<CoreOutput<CoreEndpoint.GetScrimReportCardWebhooks>> {
        const skillGroupProfile = await this.skillGroupProfiledRepository.profileRepository.findOneOrFail({
            where: {skillGroupId: scrim.skillGroupId},
            relations: {scrimReportCardWebhook: true},
        });

        // TODO: Refactor after we move to sprocket rosters
        const franchiseProfiles = await Promise.all(
            scrim.players.map(async p => {
                const mleFranchise = await this.franchiseService.getPlayerFranchises(p.userId).catch(() => null);
                if (!mleFranchise?.length) return undefined;
                const mleTeam = mleFranchise[0];

                const franchise = await this.franchiseProfiledRepository.primaryRepository.findOne({
                    where: {profile: {title: mleTeam.name}},
                    relations: {profile: {scrimReportCardWebhook: true}},
                });
                if (!franchise) return undefined;

                return franchise.profile;
            }),
        );

        return {
            skillGroupWebhook: skillGroupProfile.scrimReportCardWebhook?.url,
            franchiseWebhooks: Array.from(new Set(franchiseProfiles.map(fp => fp?.scrimReportCardWebhook?.url).filter(f => f))) as string[],
        };
    }

    async enableSubscription(): Promise<void> {
        if (this.subscribed) return;
        this.subscribed = true;
        await this.eventsService.subscribe(EventTopic.AllScrimEvents, true).then(rx => {
            rx.subscribe(v => {
                if (typeof v.payload !== "object") {
                    return;
                }

                if ((v.topic as EventTopic) !== EventTopic.ScrimMetricsUpdate) {
                    this.pubsub
                        .publish(this.allActiveScrimsSubTopic, {
                            followActiveScrims: {
                                scrim: v.payload,
                                event: v.topic,
                            },
                        })
                        .catch(this.logger.error.bind(this.logger));

                    const payload = v.payload as IScrim;
                    this.pubsub
                        .publish(payload.id, {
                            followCurrentScrim: {
                                scrim: payload,
                                event: v.topic,
                            },
                        })
                        .catch(this.logger.error.bind(this.logger));
                }

                switch (v.topic as EventTopic) {
                    case EventTopic.ScrimMetricsUpdate:
                        this.pubsub
                            .publish(this.metricsSubTopic, {
                                followScrimMetrics: v.payload,
                            })
                            .catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.ScrimCreated:
                        this.pubsub
                            .publish(this.pendingScrimsSubTopic, {
                                followPendingScrims: v.payload,
                            })
                            .catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.ScrimDestroyed:
                    case EventTopic.ScrimCancelled:
                        this.pubsub
                            .publish(this.pendingScrimsSubTopic, {
                                followPendingScrims: v.payload,
                            })
                            .catch(this.logger.error.bind(this.logger));
                        break;
                    default: {
                        const payload = v.payload as IScrim;
                        if (payload.status === ScrimStatus.PENDING || payload.status === ScrimStatus.POPPED) {
                            this.pubsub
                                .publish(this.pendingScrimsSubTopic, {
                                    followPendingScrims: payload as Scrim,
                                })
                                .catch(this.logger.error.bind(this.logger));
                        }
                        break;
                    }
                }
            });
        });
    }
}
