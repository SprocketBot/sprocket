import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import type {
    Scrim as IScrim,
    ScrimMetrics as IScrimMetrics,
    ScrimPlayer as IScrimPlayer,
    ScrimSettings as IScrimSettings,
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

import {ScrimPubSub} from "./constants";
import type {Scrim, ScrimGameMode} from "./types";

@Injectable()
export class ScrimService {
    private readonly logger = new Logger(ScrimService.name);

    private subscribed = false;

    constructor(
        private readonly matchmakingService: MatchmakingService,
        private readonly eventsService: EventsService,
        @Inject(ScrimPubSub) private readonly pubsub: PubSub,
    ) {}

    get metricsSubTopic(): string { return "metrics.update" }

    get pendingScrimsSubTopic(): string { return "scrims.created" }

    get allActiveScrimsSubTopic(): string { return "scrims.updated" }

    async getAllScrims(skillGroupId?: number): Promise<IScrim[]> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetAllScrims, {skillGroupId});

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async getScrimMetrics(): Promise<IScrimMetrics> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimMetrics, {});

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async getScrimByPlayer(playerId: number): Promise<IScrim | null> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimByPlayer, playerId);
        if (result.status === ResponseStatus.SUCCESS) {
            return result.data;
        }
        throw result.error;
    }

    async getScrimBySubmissionId(submissionId: string): Promise<IScrim | null> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
        if (result.status === ResponseStatus.SUCCESS) {
            return result.data;
        }
        throw result.error;
    }

    async getScrimById(scrimId: string): Promise<IScrim | null> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrim, scrimId);
        if (result.status === ResponseStatus.SUCCESS) {
            return result.data;
        }
        throw result.error;
    }

    async createScrim(organizationId: number, player: IScrimPlayer, settings: IScrimSettings, gameMode: ScrimGameMode, skillGroupId: number, createGroup?: boolean): Promise<IScrim> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.CreateScrim, {
            organizationId: organizationId,
            author: player,
            settings: settings,
            gameMode: gameMode,
            skillGroupId: skillGroupId,
            createGroup: Boolean(createGroup),
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async joinScrim(player: IScrimPlayer, scrimId: string, group: string | boolean | undefined): Promise<boolean> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.JoinScrim, {
            player,
            scrimId,
            group,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async leaveScrim(player: IScrimPlayer, scrimId: string): Promise<boolean> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.LeaveScrim, {
            player,
            scrimId,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async checkIn(player: IScrimPlayer, scrimId: string): Promise<boolean> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.CheckInToScrim, {
            player,
            scrimId,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async endScrim(player: IScrimPlayer, scrimId: string): Promise<boolean> {
        this.logger.log(`endScrim player=${player.id} scrimId=${scrimId}`);
        const result = await this.matchmakingService.send(MatchmakingEndpoint.EndScrim, {
            player,
            scrimId,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async resetScrim(scrimId: string, playerId?: number): Promise<boolean> {
        this.logger.log(`resetScrim player=${playerId} scrimId=${scrimId}`);
        const result = await this.matchmakingService.send(MatchmakingEndpoint.ForceUpdateScrimStatus, {
            scrimId: scrimId,
            status: ScrimStatus.IN_PROGRESS,
        });

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

    async setScrimLocked(scrimId: string, locked: boolean): Promise<boolean> {
        this.logger.log(`lockScrim scrimId=${scrimId} locked=${locked}`);
        const result = await this.matchmakingService.send(MatchmakingEndpoint.SetScrimLocked, {
            scrimId, locked,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async enableSubscription(): Promise<void> {
        if (this.subscribed) return;
        this.subscribed = true;
        await this.eventsService.subscribe(EventTopic.AllScrimEvents, true).then(rx => {
            rx.subscribe(v => {
                if (typeof v.payload !== "object") {
                    return;
                }

                if (v.topic as EventTopic !== EventTopic.ScrimMetricsUpdate) {
                    this.pubsub.publish(this.allActiveScrimsSubTopic, {
                        followActiveScrims: {
                            scrim: v.payload,
                            event: v.topic,
                        },
                    }).catch(this.logger.error.bind(this.logger));
                }

                switch (v.topic as EventTopic) {
                    case EventTopic.ScrimMetricsUpdate:
                        this.pubsub.publish(this.metricsSubTopic, {followScrimMetrics: v.payload}).catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.ScrimCreated:
                        this.pubsub.publish(this.pendingScrimsSubTopic, {followPendingScrims: v.payload}).catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.ScrimDestroyed:
                    case EventTopic.ScrimCancelled:
                        this.pubsub.publish(this.pendingScrimsSubTopic, {followPendingScrims: v.payload}).catch(this.logger.error.bind(this.logger));
                        break;
                    default: {
                        const payload = v.payload as IScrim;
                        if (payload.status === ScrimStatus.PENDING || payload.status === ScrimStatus.POPPED) {
                            this.pubsub.publish(this.pendingScrimsSubTopic, {followPendingScrims: payload as Scrim}).catch(this.logger.error.bind(this.logger));
                        }
                        this.pubsub.publish(payload.id, {
                            followCurrentScrim: {
                                scrim: payload,
                                event: v.topic,
                            },
                        }).catch(this.logger.error.bind(this.logger));
                        break;
                    }
                }
            });
        });
    }
}
