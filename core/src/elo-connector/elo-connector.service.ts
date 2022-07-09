import {
    InjectQueue, OnGlobalQueueCompleted, Processor,
} from "@nestjs/bull";
import {Injectable, Logger} from "@nestjs/common";
import type {BallchasingPlayer} from "@sprocketbot/common";
import {Job, Queue} from "bull";

import type {
    MatchParent, PlayerStatLine,
} from "../database";
import type {
    MatchSummary, PlayerSummary, SeriesStatsPayload,
} from "./elo.types";
import {GameMode, TeamColor} from "./elo.types";

@Injectable()
@Processor("elo")
export class EloConnectorService {
    private readonly logger = new Logger(EloConnectorService.name);

    constructor(@InjectQueue("elo") private eloQueue: Queue) { }

    /* eslint-disable */
    @OnGlobalQueueCompleted()
    onCompleted(job: Job, result: any): void {
        this.logger.verbose(`Job ${JSON.stringify(job)} completed with result: ${JSON.stringify(result)}`);
    }
    /* eslint-enable */

    async processSalaries(rankouts: boolean): Promise<void> {
        const job = await this.eloQueue.add("salaries", {doRankouts: rankouts});
        this.logger.verbose(`Started job in bull with ${JSON.stringify(job)} returned.`);
    }

    async runEloForSeries(match: SeriesStatsPayload, isScrim: boolean): Promise<void> {
        const job = await this.eloQueue.add("series", {match, isScrim});
        this.logger.verbose(`Started job 'series' in bull with ${JSON.stringify(job)} returned.`);
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

}
