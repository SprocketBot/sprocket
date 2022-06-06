import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {
    BallchasingPlayer, BallchasingTeam, Scrim,
} from "@sprocketbot/common";
import {
    MatchmakingEndpoint, MatchmakingService, ResponseStatus,
} from "@sprocketbot/common";
import type {QueryRunner} from "typeorm";
import {Repository} from "typeorm";

import type {GameMode, GameSkillGroup} from "../../database";
import {
    LegacyGameMode, MLE_Player, MLE_PlayerAccount,
    MLE_PlayerStats,
    MLE_PlayerStatsCore,
    MLE_Scrim,
    MLE_Series,
    MLE_SeriesReplay,
    MLE_TeamCoreStats, RocketLeagueMap,
} from "../../database/mledb";
import {GameSkillGroupService} from "../../franchise";
import {GameModeService} from "../../game";
import type {ReplaySubmission} from "../../replay-parse";
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
        private readonly skillGroupService: GameSkillGroupService,
        private readonly gameModeService: GameModeService,
        private readonly matchmakingService: MatchmakingService,
    ) {
    }

    async getLeagueAndMode(submissionId: string): Promise<{mode: GameMode; group: GameSkillGroup;}> {
        const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
        if (result.status !== ResponseStatus.SUCCESS) throw result.error;
        if (!result.data) throw new Error("Missing data on scrim response");
        const gameMode = await this.gameModeService.getGameModeById(result.data.gameMode.id);
        const skillGroup = await this.skillGroupService.getGameSkillGroupById(result.data.skillGroupId);
        return {
            mode: gameMode,
            group: skillGroup,
        };
    }

    async saveScrim(submission: ReplaySubmission, submissionId: string, runner: QueryRunner, scrimObject: Scrim): Promise<void> {
        const scrim = this.mleScrimRepository.create();
        const series = this.mleSeriesRepository.create();
        const coreStats: MLE_PlayerStatsCore[] = [];
        const playerStats: MLE_PlayerStats[] = [];
        const teamStats: MLE_TeamCoreStats[] = [];

        const {mode, group} = await this.getLeagueAndMode(submissionId);
        const author = await this.mlePlayerRepository.findOneOrFail({where: {id: -1} });
        series.league = group.description.split(" ")[0].toUpperCase();
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

        // eslint-disable-next-line require-atomic-updates
        series.seriesReplays = await Promise.all(submission.items.map(async item => {
            const data = item.progress!.result!.data;
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
                        platform: p.id.platform.toUpperCase(),
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
                core.mvp = p.stats.core.mvp;
                core.score = p.stats.core.score;
                // eslint-disable-next-line @typescript-eslint/no-extra-parens
                core.mvpr = core.goals + (core.assists * 0.75) + (core.saves * 0.60) + (core.shots / 3);

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

        await runner.manager.save(scrim);
        await runner.manager.save(series);
        await runner.manager.save(series.seriesReplays);
        await runner.manager.save(coreStats);
        await runner.manager.save(playerStats);
        await runner.manager.save(teamStats);
    }

}
