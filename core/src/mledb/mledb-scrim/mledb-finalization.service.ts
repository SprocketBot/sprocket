import {
    forwardRef, Inject, Injectable, Logger,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {
    BallchasingPlayer,
    BallchasingResponse,
    BallchasingTeam,
    CarballResponse,
    ReplaySubmission,
    Scrim,
} from "@sprocketbot/common";
import {
    BallchasingResponseSchema,
    CarballConverterService,
    CarballResponseSchema,
    Parser,
} from "@sprocketbot/common";
import type {EntityManager} from "typeorm";
import {Repository} from "typeorm";

import type {GameSkillGroup} from "$db/franchise/game_skill_group/game_skill_group.model";
import type {GameMode} from "$db/game/game_mode/game_mode.model";
import {Match} from "$db/scheduling/match/match.model";

import type {League, MLE_Platform} from "../../database/mledb";
import {
    LegacyGameMode,
    MLE_EligibilityData,
    MLE_Player,
    MLE_PlayerAccount,
    MLE_PlayerStats,
    MLE_PlayerStatsCore,
    MLE_Scrim,
    MLE_Series,
    MLE_SeriesReplay,
    MLE_TeamCoreStats,
    MLE_TeamRoleUsage,
    RocketLeagueMap,
} from "../../database/mledb";
import {GameSkillGroupService} from "../../franchise";
import {GameModeService} from "../../game";
import {UserService} from "../../identity";
import type {
    LFSReplaySubmission,
    MatchReplaySubmission,
    ScrimReplaySubmission,
} from "../../replay-parse";
import {SprocketRatingService} from "../../sprocket-rating/sprocket-rating.service";
import {MledbMatchService} from "../mledb-match/mledb-match.service";
import {assignPlayerStats} from "./assign-player-stats";
import {ballchasingMapLookup} from "./ballchasing-maps";

@Injectable()
export class MledbFinalizationService {
    private readonly logger = new Logger(MledbFinalizationService.name);
    private readonly carballConverter = new CarballConverterService();

    constructor(
    @InjectRepository(MLE_SeriesReplay)
    private readonly mleSeriesReplayRepository: Repository<MLE_SeriesReplay>,
    @InjectRepository(MLE_PlayerAccount)
    private readonly mlePlayerAccountRepository: Repository<MLE_PlayerAccount>,
    @InjectRepository(MLE_Player) private readonly mlePlayerRepository: Repository<MLE_Player>,
    @Inject(forwardRef(() => GameSkillGroupService))
    private readonly skillGroupService: GameSkillGroupService,
    private readonly gameModeService: GameModeService,
    private readonly userService: UserService,
    private readonly sprocketRatingService: SprocketRatingService,
    private readonly mleMatchService: MledbMatchService,
    ) {}

    async getLeagueAndMode(scrim: Scrim): Promise<{mode: GameMode; group: GameSkillGroup;}> {
        const gameMode = await this.gameModeService.getGameModeById(scrim.gameModeId);
        const skillGroup = await this.skillGroupService.getGameSkillGroupById(scrim.skillGroupId, {
            relations: ["profile"],
        });
        return {
            mode: gameMode,
            group: skillGroup,
        };
    }

    async saveMatch(
        submission: MatchReplaySubmission,
        submissionId: string,
        em: EntityManager,
    ): Promise<MLE_Series> {
        const sprocketMatchId = submission.matchId;

        const match = await em.findOneOrFail(Match, {
            where: {id: sprocketMatchId},
            relations: {
                matchParent: {
                    fixture: {
                        awayFranchise: {
                            profile: true,
                        },
                        homeFranchise: {
                            profile: true,
                        },
                        scheduleGroup: {
                            // Match
                            parentGroup: true, // Season
                        },
                    },
                },
                gameMode: true,
                skillGroup: {
                    profile: true,
                },
            },
        });

        const {
            homeFranchise, awayFranchise, scheduleGroup: week,
        } = match.matchParent.fixture;

        const series = await this.mleMatchService.getMleSeries(
            awayFranchise.profile.title,
            homeFranchise.profile.title,
            week.start,
            week.parentGroup.start,
            match.gameMode.teamSize === 2 ? LegacyGameMode.DOUBLES : LegacyGameMode.STANDARD,
            match.skillGroup.profile.description.split(" ")[0].toUpperCase() as League,
        );

        await this.saveSeries(submission as ReplaySubmission, submissionId, em, series);
        return series;
    }

    async saveScrim(
        submission: ScrimReplaySubmission | LFSReplaySubmission,
        submissionId: string,
        em: EntityManager,
        scrimObject: Scrim,
    ): Promise<MLE_Scrim> {
    // const mode = scrimObject.settings.teamSize === 2 ? LegacyGameMode.DOUBLES : LegacyGameMode.STANDARD;
        const {mode, group} = await this.getLeagueAndMode(scrimObject);
        const scrim = em.create(MLE_Scrim);
        const series = em.create(MLE_Series);

        scrim.series = series;
        series.scrim = scrim;

        series.league = group.profile.description.split(" ")[0].toUpperCase();
        series.mode = {
            1: LegacyGameMode.SOLO,
            2: LegacyGameMode.DOUBLES,
            3: LegacyGameMode.STANDARD,
        }[mode.teamSize]!;

        series.submissionTimestamp = new Date();
        series.fullNcp = false;

        const author = await this.mlePlayerRepository.findOneOrFail({where: {id: -1} });

        scrim.mode = series.mode;
        scrim.type = scrimObject.settings.mode.toUpperCase();
        scrim.baseScrimPoints = 3;
        scrim.author = author;
        scrim.host = author;

        await em.insert(MLE_Scrim, scrim);
        await em.insert(MLE_Series, series);

        await this.saveSeries(submission as ReplaySubmission, submissionId, em, series);

        if (scrimObject.settings.competitive) {
            const playerEligibilities = await Promise.all(scrimObject.players.map(async p => {
                const playerEligibility = em.create(MLE_EligibilityData);
                const discordAccount = await this.userService.getUserDiscordAccount(p.id);
                const player = await this.mlePlayerRepository.findOneOrFail({
                    where: {
                        discordId: discordAccount.accountId,
                    },
                });

                playerEligibility.player = player;
                playerEligibility.scrimPoints = 3;
                playerEligibility.scrim = scrim;

                return playerEligibility;
            }));

            await em.insert(MLE_EligibilityData, playerEligibilities);
        }

        return scrim;
    }

    async saveSeries(
        submission: ReplaySubmission,
        submissionId: string,
        em: EntityManager,
        series: MLE_Series,
    ): Promise<number> {
    // First; initialize all the arrays to save at the end.
        const coreStats: MLE_PlayerStatsCore[] = [];
        const playerStats: MLE_PlayerStats[] = [];
        const teamStats: MLE_TeamCoreStats[] = [];
        const roleUsages: MLE_TeamRoleUsage[] = [];

        const mleSeriesReplays = await Promise.all(submission.items.map(async (item, replayIndex) => {
            const data = this.normalizeReplayForLegacySave(
                item,
                submissionId,
                replayIndex,
            );
            // Create and prep the series entity
            const replay = em.create(MLE_SeriesReplay);
            replay.series = series;
            replay.map = ballchasingMapLookup.get(data.map_code) ?? RocketLeagueMap.UNKNOWN;
            replay.matchGuid = data.match_guid;
            replay.ballchasingId = data.id;
            replay.duration = Math.round(data.duration);
            replay.overtime = data.overtime;
            replay.overtimeSeconds = Math.round(data.overtime_seconds ?? 0);

            // Safely parse the date, falling back to current time if invalid
            const parsedDate = new Date(data.date);
            replay.played = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
            replay.playerStats = [];
            replay.playerStatsCores = [];
            replay.winningColor
          = data.orange.stats.core.goals > data.blue.stats.core.goals ? "ORANGE" : "BLUE";

            const convertPlayerToMLE = async (
                p: BallchasingPlayer,
                color: "BLUE" | "ORANGE",
            ): Promise<void> => {
                const core = em.create(MLE_PlayerStatsCore);
                const stats = em.create(MLE_PlayerStats);
                const usage = em.create(MLE_TeamRoleUsage);

                const playerAccount = await this.mlePlayerAccountRepository.findOneOrFail({
                    where: {
                        platformId: p.id.id,
                        platform: p.id.platform.toUpperCase() as MLE_Platform,
                    },
                    relations: {
                        player: true,
                    },
                });
                const player = playerAccount.player;

                core.replay = replay;
                core.color = color;
                core.shots = p.stats.core.shots;
                core.goals = p.stats.core.goals;
                core.saves = p.stats.core.saves;
                core.assists = p.stats.core.assists;
                core.goals_against = p.stats.core.goals_against;
                core.shots_against = p.stats.core.shots_against;
                core.mvp = p.stats.core.mvp;
                core.score = p.stats.core.score;

                // Helper to ensure valid numbers, preventing NaN propagation
                const safeNum = (val: number): number => (isNaN(val) || !isFinite(val) ? 0 : val);

                // Calculate MVPR with NaN protection
                // eslint-disable-next-line @typescript-eslint/no-extra-parens
                core.mvpr
            = safeNum(core.goals)
            + safeNum(core.assists) * 0.75
            + safeNum(core.saves) * 0.6
            + safeNum(core.shots) / 3;

                // Calculate sprocket rating with NaN protection
                const {
                    opi, dpi, gpi,
                } = this.sprocketRatingService.calcSprocketRating({
                    assists: safeNum(core.assists),
                    goals: safeNum(core.goals),
                    goals_against: safeNum(core.goals_against),
                    saves: safeNum(core.saves),
                    shots: safeNum(core.shots),
                    shots_against: safeNum(core.shots_against),
                    team_size: series.mode === "DOUBLES" ? 2 : 3,
                });
                core.opi = safeNum(opi);
                core.dpi = safeNum(dpi);
                core.gpi = safeNum(gpi);

                stats.replay = replay;

                core.player = player;
                stats.player = player;

                replay.playerStatsCores.push(core);
                coreStats.push(core);

                const populated = assignPlayerStats(stats, p, core);
                replay.playerStats.push(populated);
                playerStats.push(populated);

                usage.league = player.league;
                // Validate role is present before assignment to non-nullable field
                if (!player.role) {
                    throw new Error(`Player ${player.id} has no role assigned for series ${series.id}`);
                }
                usage.role = player.role;
                usage.series = series;
                // Fallback to 'FA' (Free Agent) if teamName is null
                usage.teamName = player.teamName ?? "FA";
                roleUsages.push(usage);
            };

            const buildTeamStats = (
                p: BallchasingTeam,
                color: "BLUE" | "ORANGE",
            ): MLE_TeamCoreStats => {
                const teamStat = em.create(MLE_TeamCoreStats);
                teamStat.color = color;

                if (series.fixture) {
                    const teamPlayer = replay.playerStatsCores.find(psc => psc.color === color);
                    teamStat.teamName = teamPlayer.player.teamName;
                } else {
                    teamStat.teamName = "FA";
                }

                teamStat.goals = p.stats.core.goals;
                teamStat.goalsAgainst = p.stats.core.goals_against;
                teamStat.possessionTime = p.stats.ball.possession_time;
                teamStat.timeInSide = p.stats.ball.time_in_side;

                teamStat.replay = replay;
                return teamStat;
            };

            // Convert all players to MLE rows
            await Promise.all(data.blue.players.map(async x => convertPlayerToMLE(x, "BLUE")));
            await Promise.all(data.orange.players.map(async x => convertPlayerToMLE(x, "ORANGE")));

            // Convert teams to rows
            teamStats.push(buildTeamStats(data.blue, "BLUE"), buildTeamStats(data.orange, "ORANGE"));

            // If this is a match
            if (series.fixture) {
                const firstPlayer = replay.playerStats[0];
                const firstPlayerWon = firstPlayer.coreStats.color === replay.winningColor;
                const firstPlayerIsHome = firstPlayer.player.teamName === series.fixture.homeName;
                // If the first player is home - and they won, home won. If the first player is away - and they lost, home won.
                const homeWon = firstPlayerIsHome ? firstPlayerWon : !firstPlayerWon;
                replay.winningTeamName = homeWon ? series.fixture.homeName : series.fixture.awayName;
            } else if (series.scrim) {
                replay.winningTeamName = "FA";
            } else throw new Error(`Series has neither a fixture or scrim associated with it seriesId=${series.id}`);

            return replay;
        }));

        mleSeriesReplays.forEach(sr => {
            sr.series = series;
            // @ts-expect-error Legacy Models gonna Legacy
            sr.series_id = series.id;
        });
        series.seriesReplays = mleSeriesReplays;
        await em.insert(MLE_SeriesReplay, mleSeriesReplays);
        if (coreStats.length > 0) {
            await em.insert(MLE_PlayerStatsCore, coreStats);
        }
        if (playerStats.length > 0) {
            await em.insert(MLE_PlayerStats, playerStats);
        }
        if (teamStats.length > 0) {
            await em.insert(MLE_TeamCoreStats, teamStats);
        }
        if (roleUsages.length > 0) {
            await em.insert(MLE_TeamRoleUsage, roleUsages);
        }

        return series.id;
    }

    private normalizeReplayForLegacySave(
        item: ReplaySubmission["items"][number],
        submissionId: string,
        replayIndex: number,
    ): BallchasingResponse {
        const parserType = item.progress?.result?.parser;

        if (parserType === Parser.CARBALL) {
            const parseResult = CarballResponseSchema.safeParse(item.progress?.result?.data);

            if (parseResult.success === false) {
                const {error: parseError} = parseResult;

                this.logger.warn(
                    `Degrading malformed carball payload for legacy finalization | ${JSON.stringify({
                        submissionId,
                        originalFilename: item.originalFilename,
                        outputPath: item.outputPath,
                        replayIndex,
                        issues: parseError.issues.map(issue => ({
                            path: issue.path.join("."),
                            message: issue.message,
                        })),
                    })}`,
                );

                const converted = this.carballConverter.convertToBallchasingFormat(
                    this.coerceMalformedCarballPayload(item.progress?.result?.data),
                    item.outputPath,
                );

                return {
                    ...converted,
                    match_guid: this.getLegacyReplayMatchGuid(converted.match_guid, submissionId, item, replayIndex),
                    duration: this.getLegacyReplayDuration(converted.duration),
                };
            }

            const converted = this.carballConverter.convertToBallchasingFormat(
                parseResult.data,
                item.outputPath,
            );

            return {
                ...converted,
                match_guid: this.getLegacyReplayMatchGuid(converted.match_guid, submissionId, item, replayIndex),
                duration: this.getLegacyReplayDuration(converted.duration),
            };
        }

        if (parserType === Parser.BALLCHASING) {
            const parseResult = BallchasingResponseSchema.safeParse(item.progress?.result?.data);
            if (!parseResult.success) {
                const errorDetails
                = "error" in parseResult
                    ? JSON.stringify(parseResult.error.issues)
                    : "Unknown validation error";
                throw new Error(`${item.originalFilename} does not contain expected ballchasing values. ${errorDetails}`);
            }

            return {
                ...parseResult.data,
                match_guid: this.getLegacyReplayMatchGuid(parseResult.data.match_guid, submissionId, item, replayIndex),
                duration: this.getLegacyReplayDuration(parseResult.data.duration),
            };
        }

        throw new Error(`Unknown parser type: ${parserType}. Expected ${Parser.CARBALL} or ${Parser.BALLCHASING}`);
    }

    private coerceMalformedCarballPayload(raw: unknown): CarballResponse {
        const payload = typeof raw === "object" && raw !== null
            ? raw as Record<string, unknown>
            : {};

        const gameMetadata = this.asRecord(payload.gameMetadata) ?? this.asRecord(payload.game_metadata) ?? {};
        const players = Array.isArray(payload.players) ? payload.players : [];
        const teams = Array.isArray(payload.teams) ? payload.teams : [];
        const gameStats = this.asRecord(payload.gameStats) ?? this.asRecord(payload.game_stats);

        return {
            ...payload,
            gameMetadata,
            game_metadata: gameMetadata,
            players: players as CarballResponse["players"],
            teams: teams as CarballResponse["teams"],
            gameStats: gameStats as CarballResponse["gameStats"],
            game_stats: gameStats as CarballResponse["game_stats"],
        };
    }

    private asRecord(value: unknown): Record<string, unknown> | undefined {
        return typeof value === "object" && value !== null && !Array.isArray(value)
            ? value as Record<string, unknown>
            : undefined;
    }

    private getLegacyReplayMatchGuid(
        matchGuid: string | null | undefined,
        submissionId: string,
        item: ReplaySubmission["items"][number],
        replayIndex: number,
    ): string {
        const normalizedGuid = matchGuid?.trim();
        if (normalizedGuid) return normalizedGuid;

        const fallbackGuid = [submissionId, replayIndex, item.outputPath ?? item.originalFilename ?? "missing-output-path"]
            .join(":")
            .slice(0, 255);

        this.logger.warn(
            `Using fallback legacy replay match guid | ${JSON.stringify({
                submissionId,
                originalFilename: item.originalFilename,
                outputPath: item.outputPath,
                replayIndex,
                fallbackGuid,
            })}`,
        );

        return fallbackGuid;
    }

    private getLegacyReplayDuration(duration: number | null | undefined): number {
        if (typeof duration !== "number" || Number.isNaN(duration) || !Number.isFinite(duration)) return 0;
        return Math.round(duration);
    }

    async getScrimIdByBallchasingId(ballchasingId: string): Promise<number> {
        const mleReplay = await this.mleSeriesReplayRepository.findOneOrFail({
            where: {ballchasingId: ballchasingId},
            relations: {series: {scrim: true} },
        });
        if (!mleReplay.series.scrim) throw new Error(`Replay is not for a scrim replayId=${mleReplay.id}`);
        return mleReplay.series.scrim.id;
    }

    async getMlePlayerByBallchasingPlayer(p: BallchasingPlayer): Promise<MLE_Player> {
        const playerAccount = await this.mlePlayerAccountRepository.findOneOrFail({
            where: {
                platformId: p.id.id,
                platform: p.id.platform.toUpperCase() as MLE_Platform,
            },
            relations: {player: true},
        });
        return playerAccount.player;
    }
}
