import {
    InjectQueue, OnGlobalQueueCompleted, Processor,
} from "@nestjs/bull";
import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {BallchasingPlayer} from "@sprocketbot/common";
import {Job, Queue} from "bull";
import {Repository} from "typeorm";

import type {
    MatchParent, PlayerStatLine,
} from "../database";
import {
    Match,
    Player, Round, Team,
} from "../database";
import type {
    MatchSummary, PlayerSummary, SalaryPayloadItem, SeriesStatsPayload,
} from "./elo.types";
import {
    GameMode, SeriesType, TeamColor,
} from "./elo.types";

@Injectable()
@Processor("elo")
export class EloConnectorService {
    private readonly logger = new Logger(EloConnectorService.name);

    constructor(
        @InjectQueue("elo") private eloQueue: Queue,
        @InjectRepository(Player) private readonly playerRepository: Repository<Player>,
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>,
        @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
        @InjectRepository(Match) private readonly matchRepository: Repository<Match>,
    ) { }

    /* eslint-disable */
    @OnGlobalQueueCompleted()
    async onCompleted(job: Job, result: any): Promise<void> {
        const resObj = JSON.parse(result);
        this.logger.verbose(`Job ${JSON.stringify(job)} completed with result: ${result}, and ${JSON.stringify(resObj)}`);
        if (resObj.jobType) {
            this.logger.verbose(`Salary job finished, processing on postgres side now. `);
            await this.saveSalaries(resObj.data);
        }
    }
    /* eslint-enable */

    async saveSalaries(payload: SalaryPayloadItem[][]): Promise<void> {
        await Promise.all(payload.map(async sg => {
            await Promise.all(sg.map(async deltaP => {
                let player = await this.playerRepository.findOneOrFail(deltaP.playerId);

                player = this.playerRepository.merge(player, {
                    skillGroupId: player.skillGroupId + deltaP.sgDelta,
                    salary: deltaP.newSalary,
                });
                await this.playerRepository.save(player);
            }));
        }));
    }

    async processSalaries(rankouts: boolean): Promise<void> {
        const job = await this.eloQueue.add("salaries", {doRankouts: rankouts});
        this.logger.verbose(`Started job in bull with ${JSON.stringify(job)} returned.`);
    }

    async runEloForSeries(match: SeriesStatsPayload, isScrim: boolean): Promise<void> {
        const job = await this.eloQueue.add("series", {match, isScrim});
        this.logger.verbose(`Started job 'series' in bull with ${JSON.stringify(job)} returned.`);
    }

    async sendReplaysToElo(replayIds: number[], isNcp: boolean): Promise<void> {
        const job = await this.eloQueue.add("ncps", {replayIds, isNcp});
        this.logger.verbose(`Started job 'ncps' in bull with ${JSON.stringify(job)} returned.`);
    }

    translatePayload(matchParent: MatchParent, isScrim: boolean): SeriesStatsPayload {
        const match = matchParent.match;
        const payload: Partial<SeriesStatsPayload> = {
            id: match.id,
            numGames: match.rounds.length,
            isScrim: isScrim,
            gameMode: (matchParent.event?.gameMode?.teamSize === 2) ? GameMode.DOUBLES : GameMode.STANDARD,
            gameStats: [],
        };

        let i = 0;
        for (i = 0;i < match.rounds.length;i++) {
            const round = match.rounds[i];
            const orangeStats: BallchasingPlayer[] = (round.teamStats[1].playerStats.map(p => p.stats)) as BallchasingPlayer[];
            const blueStats: BallchasingPlayer[] = (round.teamStats[0].playerStats.map(p => p.stats)) as BallchasingPlayer[];
            const summary: MatchSummary = {
                id: round.id,
                orangeWon: !round.homeWon,
                scoreOrange: orangeStats.reduce((sum, p) => sum + p.stats.core.goals, 0),
                scoreBlue: blueStats.reduce((sum, p) => sum + p.stats.core.goals, 0),
                blue: round.teamStats[0].playerStats.map(p => this.translatePlayerStats(p, TeamColor.BLUE)),
                orange: round.teamStats[1].playerStats.map(p => this.translatePlayerStats(p, TeamColor.ORANGE)),
            };

            payload.gameStats?.push(summary);
        }
        return payload as SeriesStatsPayload;
    }

    translatePlayerStats(p: PlayerStatLine, team: TeamColor): PlayerSummary {
        return {
            id: p.player.id,
            name: "",
            team: team,
            mvpr: this.calculateMVPR(p.stats as BallchasingPlayer),
        } as PlayerSummary;
    }

    calculateMVPR(p: BallchasingPlayer): number {
        return p.stats.core.goals + (p.stats.core.assists * 0.75) + (p.stats.core.saves * 0.60) + (p.stats.core.shots / 3);
    }

    /**
     * Marks replays as NCP=true/false, and updates the associated Elo of those replays and all connected replays accordingly.
     * "Connected" replays are where replays in which one of the player's in the NCP replay has played. Since the NCP replay will have its elo affects removed,
     * all subsequent replays where those player's played need to be recalculated.
     * @param replayId The replay to mark NCP=true/false.
     * @param isNcp Whether the given replayId should be marked NCP or un-NCP.
     * @returns A string containing status of what was updated.
     */
    async markReplaysNcp(replayIds: number[], isNcp: boolean, winningTeamInput?: Team): Promise<string> {
        const r = Math.floor(Math.random() * 10000);
        this.logger.verbose(`(${r}) begin markReplaysNcp: replayIds=${replayIds}, isNcp=${isNcp}, winningTeam=${winningTeamInput}`);

        // Find the winning team and it's franchise profile, since that's where
        // team names are in Sprocket.
        const winningTeam = await this.teamRepository.findOne(winningTeamInput?.id, {where: {id: winningTeamInput?.id}, relations: ["franchise", "franchise.profile"] });

        if (isNcp && !winningTeam) return "Winning team must be specified if NCPing replays";

        // Make sure we are considering replayIds in chronological order
        replayIds.sort((r1, r2) => r1 - r2);

        // Gather replays
        const replayPromises = replayIds.map(async rId => this.roundRepository.findOneOrFail(rId));
        const replays = await Promise.all(replayPromises);

        // Check to make sure the winning team played in each replay
        if (winningTeam) {
            for (const replay of replays) {
                if (replay.isDummy) continue; // Don't need to check dummy replays
                const teamsInReplay = replay.teamStats.map(tsl => tsl.teamName);
                if (!teamsInReplay.includes(winningTeam.franchise.profile.title)) {
                    this.logger.error(`The team \`${winningTeam.franchise.profile.title}\` did not play in replay with id \`${replay.id}\` (${teamsInReplay.join(" v. ")}), and therefore cannot be marked as the winner of this NCP. Cancelling process with no action taken.`);
                    this.logger.warn(`Could not find team=${winningTeam.franchise.profile.title} on replay with id=${replay.id}, cannot mark as NCP`);
                    throw new Error(`Could not find team=${winningTeam.franchise.profile.title} on replay with id=${replay.id}, cannot mark as NCP`);
                }
            }
        }

        // Set replays to NCP true/false and update winning team/color
        for (const replay of replays) {
            let newHomeWon: boolean = false;

            // Handle NCPing/Un-NCPing with non-dummy/dummy replays
            if (isNcp) {
                if (!replay.isDummy) {
                    newHomeWon = !replay.homeWon;
                } else {
                    newHomeWon = false;
                }
            } else if (!replay.isDummy) {
                newHomeWon = !replay.homeWon;
            }

            // If Un-NCPing a dummy replay, just delete it
            if (!isNcp && replay.isDummy) {
                await this.roundRepository.delete(replay.id);
            } else {
                replay.homeWon = newHomeWon;
                await this.roundRepository.save(replay);
            }
        }

        // Magic happens here to talk to the ELO service
        const noDummies = replays.filter(rep => !rep.isDummy).map(rep => rep.id);
        await this.sendReplaysToElo(noDummies, isNcp);

        const outStr = `\`${replayIds.length === 1
            ? `replayId=${replayIds[0]}`
            : `replayIds=[${replayIds.join(", ")}]`
        }\` successfully marked \`ncp=${isNcp}\`, ${winningTeam
            ? `\`winningTeam=${winningTeam.franchise.profile.title}\``
            : ""
        } with updated elo, and all connected replays had their elo updated.`;

        return outStr;
    }

    /**
     * Marks a series (with either a fixture or scrim) as full_ncp=true/false, marks all associated replays as ncp=true, and updates the associated Elo of those replays and all connected replays accordingly.
     * "Connected" replays are where replays in which one of the player's in the NCP replay has played. Since the NCP replay will have its elo affects removed,
     * all subsequent replays where those player's played need to be recalculated.
     * @param seriesId The series to mark full_ncp=true/false.
     * @param isNcp Whether the given replayId should be marked NCP or un-NCP.
     * @param progressMessage A message to update with the progress of the NCP processing.
     * @param seriesType Whether the series is a fixture or scrim series, used for input validation and for difference in actions between fixtures/scrims.
     * @param winningTeam The team that should win the NCP. Required if seriesType=Fixture and isNcp=true.
     * @param numReplays The number of replays that should be in the series. Optional. Used to add dummy replays in place of replays that weren't submitted for some reason.
     * @returns A string containing a summary of the actions that took place when the processing has completed.
     */
    async markSeriesNcp(seriesId: number, isNcp: boolean, seriesType: SeriesType, winningTeamInput?: Team, numReplays?: number): Promise<string> {
        const r = Math.floor(Math.random() * 10000);
        this.logger.verbose(`(${r}) begin markSeriesNcp: seriesId=${seriesId}, isNcp=${isNcp}, winningTeam=${winningTeamInput}`);

        // Find the winning team and it's franchise profile, since that's where
        // team names are in Sprocket.
        let winningTeam = await this.teamRepository.findOne(winningTeamInput?.id, {where: {id: winningTeamInput?.id}, relations: ["franchise", "franchise.profile"] });

        // const series = await this.ss.getSeriesById(seriesId, ["fixture.home",
        // "fixture.away"]);
        const series = await this.matchRepository.findOneOrFail(seriesId, {where: {id: seriesId}, relations: ["matchParent", "rounds"] });

        if (seriesType === SeriesType.Fixture) {

            if (!series.matchParent.fixture) {
                return `Error: series with id=\`${seriesId}\` has no associated fixture. If this is a scrim, please use \`!ncpScrim\` or \`!unNcpScrim\`. If this actually is a league play series, ping Bot Team.`;
            }

            // Winning team must be specified if NCPing replays
            if (isNcp && !winningTeam) {
                return "When NCPing a series associated with a fixture, you must specify a winningTeam";
            }

            // Check to make sure the winning team played in the series/fixture
            if (winningTeam
                && series.matchParent.fixture.homeFranchise !== winningTeam.franchise
                && series.matchParent.fixture.awayFranchise !== winningTeam.franchise) {
                return `The team \`${winningTeam?.franchise.profile.title}\` did not play in series with id \`${series.id}\` (${series.matchParent.fixture.awayFranchise.profile.title} v. ${series.matchParent.fixture.homeFranchise.profile.title}), and therefore cannot be marked as the winner of this NCP. Cancelling process with no action taken.`;
            }

        } else if (seriesType === SeriesType.Scrim) {
            if (!series.matchParent.scrimMeta) {
                return `Error: series with id=\`${seriesId}\` has no associated scrim. If this is a league play series, please use \`!ncpSeries\` or \`!unNcpSeries\`. If this actually is a scrim, ping Bot Team.`;
            }
            // winningTeam = await this.ts.resolveTeam("FA");
            winningTeam = await this.teamRepository.findOneOrFail(0); // TODO: ID for FA team
        } else {
            throw new Error();
        }

        const seriesReplays: Round[] = series.rounds;

        // Add dummy replays
        let dummiesNeeded: number = 0;
        if (numReplays) {
            dummiesNeeded = numReplays - seriesReplays.length;
            for (let i = 0;i < dummiesNeeded;i++) {
                const dummy: Partial<Round> = {
                    isDummy: true,
                    match: series,
                    playerStats: [],
                    teamStats: [],
                    roundStats: "",
                    homeWon: false,
                };

                const result = this.roundRepository.create(dummy);
                seriesReplays.push(result);
            }
        }

        // Set series to Full NCP and set winning team
        // await this.ss.updateSeries({fullNcp: isNcp}, seriesId);
        series.isNcp = isNcp;
        await this.matchRepository.save(series);

        // Update each series replay (including any dummies) to NCP
        const replayIds = seriesReplays.map(replay => replay.id);
        await this.markReplaysNcp(replayIds, isNcp, winningTeam);

        this.logger.verbose(`(${r}) end markSeriesNcp`);

        const seriesTypeStr = seriesType === SeriesType.Fixture ? "fixture" : seriesType === SeriesType.Scrim ? "scrim" : null;
        return `\`seriesId=${seriesId}\` ${seriesTypeStr ? `(${seriesTypeStr})` : ""} successfully marked \`fullNcp=${isNcp}\` with updated elo, and all connected replays had their elo updated.${numReplays && dummiesNeeded ? ` **${dummiesNeeded} dummy replay(s)** were added to the series.` : ""}`;
    }
}
