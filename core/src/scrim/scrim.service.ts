import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {
    CoreEndpoint,
    CoreInput,
    CoreOutput,
    CreateLFSScrimRequest,
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
import {concatMap} from "rxjs";
import {Repository} from "typeorm";

import type {GameSkillGroup} from "$db/franchise/game_skill_group/game_skill_group.model";
import type {GameMode} from "$db/game/game_mode/game_mode.model";
import {PlayerStatLine} from "$db/scheduling/player_stat_line/player_stat_line.model";

import {GameSkillGroupService} from "../franchise";
import {FranchiseService} from "../franchise/franchise";
import {GameModeService} from "../game";
import {MledbFinalizationService} from "../mledb";
import {MemberService} from "../organization";
import {TtlCache} from "../util/ttl-cache";
import {ScrimPubSub, SCRIM_CACHE_TTL_MS} from "./constants";
import type {Scrim} from "./types";

@Injectable()
export class ScrimService {
    private readonly logger = new Logger(ScrimService.name);

    private subscribed = false;

    private readonly gameModeCache = new TtlCache<number, GameMode>(SCRIM_CACHE_TTL_MS);

    private readonly skillGroupCache = new TtlCache<number, GameSkillGroup>(SCRIM_CACHE_TTL_MS);

    constructor(
        private readonly matchmakingService: MatchmakingService,
        private readonly eventsService: EventsService,
        private readonly gameSkillGroupService: GameSkillGroupService,
        private readonly gameModeService: GameModeService,
        private readonly memberService: MemberService,
        private readonly franchiseService: FranchiseService,
        private readonly mleScrimService: MledbFinalizationService,
    @Inject(ScrimPubSub) private readonly pubsub: PubSub,
    @InjectRepository(PlayerStatLine)
    private readonly playerStatLineRepository: Repository<PlayerStatLine>,
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

    get lfsScrimsSubTopic(): string {
        return "scrims.lfs";
    }

    async getAllScrims(skillGroupId?: number): Promise<IScrim[]> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetAllScrims, {
            skillGroupId,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async getScrimMetrics(): Promise<IScrimMetrics> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimMetrics, {});

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async getScrimByPlayer(playerId: number): Promise<IScrim | null> {
        const result = await this.matchmakingService.send(
            MatchmakingEndpoint.GetScrimByPlayer,
            playerId,
        );
        if (result.status === ResponseStatus.SUCCESS) {
            return result.data;
        }
        throw result.error;
    }

    async getScrimBySubmissionId(submissionId: string): Promise<IScrim | null> {
        const result = await this.matchmakingService.send(
            MatchmakingEndpoint.GetScrimBySubmissionId,
            submissionId,
        );
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

    async createScrim(data: CreateScrimOptions): Promise<IScrim> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.CreateScrim, data);

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async createLFSScrim(data: CreateLFSScrimRequest): Promise<IScrim> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.CreateLFSScrim, data);

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async joinScrim(data: JoinScrimOptions): Promise<boolean> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.JoinScrim, data);

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async leaveScrim(playerId: number, scrimId: string): Promise<boolean> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.LeaveScrim, {
            playerId: playerId,
            scrimId: scrimId,
        });

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async checkIn(playerId: number, scrimId: string): Promise<boolean> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.CheckInToScrim, {
            playerId,
            scrimId,
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
            scrimId,
            locked,
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
            },
            order: {id: "DESC"},
            relations: ["player", "player.member", "player.member.user", "round"],
        });
        const roundStats = psl.round.roundStats as {ballchasingId: string;};
        return this.mleScrimService.getScrimIdByBallchasingId(roundStats.ballchasingId);
    }

    async getRelevantWebhooks(scrim: CoreInput<CoreEndpoint.GetScrimReportCardWebhooks>): Promise<CoreOutput<CoreEndpoint.GetScrimReportCardWebhooks>> {
        const skillGroup = await this.gameSkillGroupService.getGameSkillGroupById(scrim.skillGroupId, {
            relations: {
                profile: {
                    scrimReportCardWebhook: true,
                },
            },
        });

        // TODO: Refactor after we move to sprocket rosters
        const franchiseProfiles = await Promise.all(scrim.players.map(async p => {
            const sprocketMember = await this.memberService.getMember({where: {userId: p.id} });
            const mleFranchise = await this.franchiseService
                .getPlayerFranchisesByUserId(p.id)
                .catch(() => null);
            if (!mleFranchise?.length) return undefined;
            const mleTeam = mleFranchise[0];

            const franchise = await this.franchiseService
                .getFranchise({
                    where: {profile: {title: mleTeam.name} },
                    relations: {
                        profile: {
                            scrimReportCardWebhook: true,
                        },
                    },
                })
                .catch(() => null);
            if (!franchise) return undefined;

            return franchise.profile;
        }));

        return {
            skillGroupWebhook: skillGroup.profile.scrimReportCardWebhook?.url,
            franchiseWebhooks: Array.from(new Set(franchiseProfiles.map(fp => fp?.scrimReportCardWebhook?.url).filter(f => f))) as string[],
        };
    }

    private resolveGameMode(gameModeId: number): Promise<GameMode> {
        const cacheMissFn = (): Promise<GameMode> => this.gameModeService.getGameModeById(gameModeId);
        return this.gameModeCache.getOrLoad(gameModeId, cacheMissFn);
    }

    private resolveSkillGroup(skillGroupId: number): Promise<GameSkillGroup> {
        const cacheMissFn = (): Promise<GameSkillGroup> => this.gameSkillGroupService.getGameSkillGroupById(skillGroupId);
        return this.skillGroupCache.getOrLoad(skillGroupId, cacheMissFn);
    }

    async enableSubscription(): Promise<void> {
        if (this.subscribed) return;
        this.subscribed = true;
        const rx = await this.eventsService.subscribe(EventTopic.AllScrimEvents, true);
        rx.pipe(concatMap(async v => {
            if (typeof v.payload !== "object") {
                return;
            }

            let scrim: Scrim | undefined;
            if ((v.topic as EventTopic) !== EventTopic.ScrimMetricsUpdate) {
                scrim = {...(v.payload as Scrim)};

                // Add gameMode/skillGroup to msg before publishing
                try {
                    if (scrim.gameModeId && !scrim.gameMode) {
                        scrim.gameMode = await this.resolveGameMode(scrim.gameModeId);
                    }
                    if (scrim.skillGroupId && !scrim.skillGroup) {
                        scrim.skillGroup = await this.resolveSkillGroup(scrim.skillGroupId);
                    }
                } catch (err) {
                    this.logger.error("Failed to add gameMode/skillGroup to scrim", err as Error);
                }

                this.pubsub
                    .publish(this.allActiveScrimsSubTopic, {
                        followActiveScrims: {
                            scrim: scrim,
                            event: v.topic,
                        },
                    })
                    .catch(this.logger.error.bind(this.logger));

                this.pubsub
                    .publish(scrim.id, {
                        followCurrentScrim: {
                            scrim: scrim,
                            event: v.topic,
                        },
                    })
                    .catch(this.logger.error.bind(this.logger));
            }

            switch (v.topic as EventTopic) {
                case EventTopic.ScrimMetricsUpdate:
                    this.pubsub
                        .publish(this.metricsSubTopic, {followScrimMetrics: v.payload})
                        .catch(this.logger.error.bind(this.logger));
                    break;
                case EventTopic.ScrimCreated:
                case EventTopic.ScrimDestroyed:
                case EventTopic.ScrimCancelled:
                    if (scrim) {
                        this.pubsub
                            .publish(this.pendingScrimsSubTopic, {followPendingScrims: scrim})
                            .catch(this.logger.error.bind(this.logger));
                    }
                    break;
                default:
                    if (scrim && (scrim.status === ScrimStatus.PENDING || scrim.status === ScrimStatus.POPPED)) {
                        this.pubsub
                            .publish(this.pendingScrimsSubTopic, {followPendingScrims: scrim})
                            .catch(this.logger.error.bind(this.logger));
                    }
                    break;
            }
        })).subscribe();
    }
}
