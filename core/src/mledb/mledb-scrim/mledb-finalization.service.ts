import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {
    BallchasingPlayer,
    BallchasingResponse,
    BallchasingTeam,
    ReplaySubmission,
    Scrim,
} from "@sprocketbot/common";
import type {EntityManager} from "typeorm";
import {Repository} from "typeorm";

import type {League, MLE_Platform} from "$mledb";
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
} from "$mledb";
import type {GameMode, GameSkillGroup} from "$models";
import {GameModeRepository, GameSkillGroupRepository} from "$repositories";

import {Match} from "../../database";
import {GameSkillGroupService} from "../../franchise";
import {UserService} from "../../identity";
import type {MatchReplaySubmission, ScrimReplaySubmission} from "../../replay-parse";
import {SprocketRatingService} from "../../sprocket-rating/sprocket-rating.service";
import {MledbMatchService} from "../mledb-match/mledb-match.service";
import {assignPlayerStats} from "./assign-player-stats";
import {ballchasingMapLookup} from "./ballchasing-maps";

@Injectable()
export class MledbFinalizationService {
    constructor(
        @InjectRepository(MLE_SeriesReplay)
        private readonly mleSeriesReplayRepository: Repository<MLE_SeriesReplay>,
        @InjectRepository(MLE_PlayerAccount)
        private readonly mlePlayerAccountRepository: Repository<MLE_PlayerAccount>,
        @InjectRepository(MLE_Player)
        private readonly mlePlayerRepository: Repository<MLE_Player>,
        @Inject(forwardRef(() => GameSkillGroupService))
        private readonly skillGroupRepository: GameSkillGroupRepository,
        private readonly gameModeRepository: GameModeRepository,
        private readonly userService: UserService,
        private readonly sprocketRatingService: SprocketRatingService,
        private readonly mleMatchService: MledbMatchService,
    ) {}

    async getLeagueAndMode(scrim: Scrim): Promise<{mode: GameMode; group: GameSkillGroup}> {
        const gameMode = await this.gameModeRepository.getById(scrim.gameModeId);
        const skillGroup = await this.skillGroupRepository.getById(scrim.skillGroupId, {
            relations: {profile: true},
        });
        return {
            mode: gameMode,
            group: skillGroup,
        };
    }

    async saveMatch(submission: MatchReplaySubmission, submissionId: string, em: EntityManager): Promise<MLE_Series> {
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

        const {homeFranchise, awayFranchise, scheduleGroup: week} = match.matchParent.fixture!;

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
        submission: ScrimReplaySubmission,
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

        const author = await this.mlePlayerRepository.findOneOrFail({
            where: {id: -1},
        });

        scrim.mode = series.mode;
        scrim.type = scrimObject.settings.mode.toUpperCase();
        scrim.baseScrimPoints = 5;
        scrim.author = author;
        scrim.host = author;

        await em.insert(MLE_Scrim, scrim);
        await em.insert(MLE_Series, series);

        await this.saveSeries(submission as ReplaySubmission, submissionId, em, series);

        if (scrimObject.settings.competitive) {
            const playerEligibilities = await Promise.all(
                scrimObject.players.map(async p => {
                    const playerEligibility = em.create(MLE_EligibilityData);
                    const discordAccount = await this.userService.getUserDiscordAccount(p.id);
                    const player = await this.mlePlayerRepository.findOneOrFail({
                        where: {
                            discordId: discordAccount.accountId,
                        },
                    });

                    playerEligibility.player = player;
                    playerEligibility.scrimPoints = 5;
                    playerEligibility.scrim = scrim;

                    return playerEligibility;
                }),
            );

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

        const mleSeriesReplays = await Promise.all(
            submission.items.map(async item => {
                // Get the ballchasing data that is available
                const data: BallchasingResponse = item.progress!.result!.data;
                // Create and prep the series entity
                const replay = em.create(MLE_SeriesReplay);
                replay.series = series;
                replay.map = ballchasingMapLookup.get(data.map_code) ?? RocketLeagueMap.UNKNOWN;
                replay.matchGuid = data.match_guid;
                replay.ballchasingId = data.id;
                replay.duration = data.duration;
                replay.overtime = data.overtime;
                replay.overtimeSeconds = data.overtime_seconds ?? 0;
                replay.played = new Date(data.date);
                replay.playerStats = [];
                replay.playerStatsCores = [];
                replay.winningColor = data.orange.stats.core.goals > data.blue.stats.core.goals ? "ORANGE" : "BLUE";

                const convertPlayerToMLE = async (p: BallchasingPlayer, color: "BLUE" | "ORANGE"): Promise<void> => {
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
                    // eslint-disable-next-line @typescript-eslint/no-extra-parens
                    core.mvpr = core.goals + core.assists * 0.75 + core.saves * 0.6 + core.shots / 3;
                    const {opi, dpi, gpi} = this.sprocketRatingService.calcSprocketRating({
                        assists: core.assists,
                        goals: core.goals,
                        goals_against: core.goals_against,
                        saves: core.saves,
                        shots: core.shots,
                        shots_against: core.shots_against,
                        team_size: series.mode === "DOUBLES" ? 2 : 3,
                    });
                    core.opi = opi;
                    core.dpi = dpi;
                    core.gpi = gpi;

                    stats.replay = replay;

                    core.player = player;
                    stats.player = player;

                    replay.playerStatsCores.push(core);
                    coreStats.push(core);

                    const populated = assignPlayerStats(stats, p, core);
                    replay.playerStats.push(populated);
                    playerStats.push(populated);

                    usage.league = player.league;
                    usage.role = player.role!;
                    usage.series = series;
                    usage.teamName = player.teamName;
                    roleUsages.push(usage);
                };

                const buildTeamStats = (p: BallchasingTeam, color: "BLUE" | "ORANGE"): MLE_TeamCoreStats => {
                    const teamStat = em.create(MLE_TeamCoreStats);
                    teamStat.color = color;

                    if (series.fixture) {
                        const teamPlayer = replay.playerStatsCores.find(psc => psc.color === color);
                        teamStat.teamName = teamPlayer!.player.teamName;
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
                } else
                    throw new Error(`Series has neither a fixture or scrim associated with it seriesId=${series.id}`);

                return replay;
            }),
        );

        mleSeriesReplays.forEach(sr => {
            sr.series = series;
            // @ts-expect-error Legacy Models gonna Legacy
            sr.series_id = series.id;
        });
        series.seriesReplays = mleSeriesReplays;
        await em.insert(MLE_SeriesReplay, mleSeriesReplays);
        await em.insert(MLE_PlayerStatsCore, coreStats);
        await em.insert(MLE_PlayerStats, playerStats);
        await em.insert(MLE_TeamCoreStats, teamStats);
        await em.insert(MLE_TeamRoleUsage, roleUsages);

        return series.id;
    }

    async getScrimIdByBallchasingId(ballchasingId: string): Promise<number> {
        const mleReplay = await this.mleSeriesReplayRepository.findOneOrFail({
            where: {ballchasingId: ballchasingId},
            relations: {series: {scrim: true}},
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
