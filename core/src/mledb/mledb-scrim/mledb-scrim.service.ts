import {
    forwardRef, Inject, Injectable,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {
    BallchasingPlayer, BallchasingResponse, BallchasingTeam, ReplaySubmission, Scrim,
} from "@sprocketbot/common";
import type {QueryRunner} from "typeorm";
import {Repository} from "typeorm";

import type {GameMode, GameSkillGroup} from "../../database";
import type {MLE_Platform} from "../../database/mledb";
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
    MLE_TeamCoreStats, RocketLeagueMap,
} from "../../database/mledb";
import {GameSkillGroupService} from "../../franchise";
import {GameModeService} from "../../game";
import {UserService} from "../../identity";
import {SprocketRatingService} from "../../sprocket-rating/sprocket-rating.service";
import {assignPlayerStats} from "./assign-player-stats";
import {ballchasingMapLookup} from "./ballchasing-maps";

@Injectable()
export class MledbScrimService {
    constructor(
        @InjectRepository(MLE_Scrim) private readonly mleScrimRepository: Repository<MLE_Scrim>,
        @InjectRepository(MLE_Series) private readonly mleSeriesRepository: Repository<MLE_Series>,
        @InjectRepository(MLE_SeriesReplay) private readonly mleSeriesReplayRepositroy: Repository<MLE_SeriesReplay>,
        @InjectRepository(MLE_PlayerStatsCore) private readonly mlePlayerStatsCoreRepository: Repository<MLE_PlayerStatsCore>,
        @InjectRepository(MLE_PlayerStats) private readonly mlePlayerStatsRepository: Repository<MLE_PlayerStats>,
        @InjectRepository(MLE_TeamCoreStats) private readonly mleTeamCoreStatsRepository: Repository<MLE_TeamCoreStats>,
        @InjectRepository(MLE_PlayerAccount) private readonly mlePlayerAccountRepository: Repository<MLE_PlayerAccount>,
        @InjectRepository(MLE_Player) private readonly mlePlayerRepository: Repository<MLE_Player>,
        @InjectRepository(MLE_EligibilityData) private readonly mleEligibilityRepository: Repository<MLE_EligibilityData>,
        @Inject(forwardRef(() => GameSkillGroupService))
        private readonly skillGroupService: GameSkillGroupService,
        private readonly gameModeService: GameModeService,
        private readonly userService: UserService,
        private readonly sprocketRatingService: SprocketRatingService,
    ) {
    }

    async getLeagueAndMode(scrim: Scrim): Promise<{mode: GameMode; group: GameSkillGroup;}> {
        const gameMode = await this.gameModeService.getGameModeById(scrim.gameMode.id);
        const skillGroup = await this.skillGroupService.getGameSkillGroupById(scrim.skillGroupId, {relations: ["profile"] });
        return {
            mode: gameMode,
            group: skillGroup,
        };
    }

    async saveMatch(submission: ReplaySubmission, submissionId: string, runner: QueryRunner, series: MLE_Series): Promise<number> {
        return this.saveSeries(submission, submissionId, runner, series);
    }

    async saveScrim(submission: ReplaySubmission, submissionId: string, runner: QueryRunner, scrimObject: Scrim): Promise<MLE_Scrim> {
        const scrim = this.mleScrimRepository.create();
        const series = this.mleSeriesRepository.create();

        const {mode, group} = await this.getLeagueAndMode(scrimObject);
        const author = await this.mlePlayerRepository.findOneOrFail({where: {id: -1} });
        series.league = group.profile.description.split(" ")[0].toUpperCase();
        series.mode = {
            1: LegacyGameMode.SOLO, 2: LegacyGameMode.DOUBLES, 3: LegacyGameMode.STANDARD,
        }[mode.teamSize]!;
        scrim.series = series;
        series.scrim = scrim;

        scrim.mode = series.mode;
        scrim.type = scrimObject.settings.mode.toUpperCase();
        scrim.baseScrimPoints = 5;
        scrim.author = author;

        series.submissionTimestamp = new Date();
        series.fullNcp = false;

        const playerEligibilities: MLE_EligibilityData[] = await Promise.all(scrimObject.players.map(async p => {
            const playerEligibility = this.mleEligibilityRepository.create();
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
        }));

        await runner.manager.save(scrim);
        await this.saveSeries(submission, submissionId, runner, series);
        await runner.manager.save(playerEligibilities);

        return scrim;
    }

    async saveSeries(submission: ReplaySubmission, submissionId: string, runner: QueryRunner, series: MLE_Series): Promise<number> {
        const coreStats: MLE_PlayerStatsCore[] = [];
        const playerStats: MLE_PlayerStats[] = [];
        const teamStats: MLE_TeamCoreStats[] = [];

        const mleSeriesReplays = await Promise.all(submission.items.map(async item => {
            const data: BallchasingResponse = item.progress!.result!.data;
            const replay = this.mleSeriesReplayRepositroy.create();
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
                const core = this.mlePlayerStatsCoreRepository.create();
                const stats = this.mlePlayerStatsRepository.create();

                const playerAccount = await this.mlePlayerAccountRepository.findOneOrFail({
                    where: {
                        platformId: p.id.id,
                        platform: p.id.platform.toUpperCase() as MLE_Platform,
                    },
                    relations: ["player"],
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
                core.mvpr = core.goals + (core.assists * 0.75) + (core.saves * 0.60) + (core.shots / 3);
                const {
                    opi, dpi, gpi,
                } = this.sprocketRatingService.calcSprocketRating({
                    assists: core.assists,
                    goals: core.goals,
                    goals_against: core.goals_against,
                    saves: core.saves,
                    shots: core.shots,
                    shots_against: core.shots_against,
                    team_size: data.team_size,
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
            };

            const buildTeamStats = (p: BallchasingTeam, color: "BLUE" | "ORANGE"): MLE_TeamCoreStats => {
                const teamStat = this.mleTeamCoreStatsRepository.create();
                teamStat.color = color;

                teamStat.goals = p.stats.core.goals;
                teamStat.goalsAgainst = p.stats.core.goals_against;
                teamStat.possessionTime = p.stats.ball.possession_time;
                teamStat.timeInSide = p.stats.ball.time_in_side;

                teamStat.replay = replay;
                return teamStat;
            };

            await Promise.all(data.blue.players.map(async x => convertPlayerToMLE(x, "BLUE")));
            replay.teamCoreStats = [
                buildTeamStats(data.blue, "BLUE"),
                buildTeamStats(data.orange, "ORANGE"),
            ];

            teamStats.push(...replay.teamCoreStats);

            await Promise.all(data.orange.players.map(async x => convertPlayerToMLE(x, "ORANGE")));

            return replay;
        }));

        series.seriesReplays = mleSeriesReplays;

        await runner.manager.save(series);
        await runner.manager.save(mleSeriesReplays);
        await runner.manager.save(coreStats);
        await runner.manager.save(playerStats);
        await runner.manager.save(teamStats);

        return series.id;
    }

    async getScrimIdByBallchasingId(ballchasingId: string): Promise<number> {
        const mleReplay = await this.mleSeriesReplayRepositroy.findOneOrFail({where: {ballchasingId}, relations: ["series", "series.scrim"] });
        return mleReplay.series.scrim.id;
    }

    async getMlePlayerByBallchasingPlayer(p: BallchasingPlayer): Promise<MLE_Player> {
        const playerAccount = await this.mlePlayerAccountRepository.findOneOrFail({
            where: {
                platformId: p.id.id,
                platform: p.id.platform.toUpperCase() as MLE_Platform,
            },
            relations: ["player"],
        });
        return playerAccount.player;
    }
}
