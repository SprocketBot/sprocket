import {Injectable} from "@nestjs/common";
import type {ParsedReplay, ReplaySubmissionStats} from "@sprocketbot/common";
import {CarballConverterService, Parser} from "@sprocketbot/common";

@Injectable()
export class StatsConverterService {
    private readonly carballConverter = new CarballConverterService();

    convertStats(rawStats: ParsedReplay[]): ReplaySubmissionStats {
    // TODO in the future, we will be able to translate the ballchasing player to a Sprocket member
    // in the validation step. Since we don't have that, for now we will just use the names from
    // the replays directly
        const out: ReplaySubmissionStats = {
            games: [],
        };

        for (const raw of rawStats) {
            const {parser, data} = raw;
            switch (parser) {
                case Parser.BALLCHASING: {
                    // teams = [blue, orange]
                    const blueGoals = data.blue.stats.core.goals;
                    const orangeGoals = data.orange.stats.core.goals;
                    const blueWon = blueGoals > orangeGoals;
                    const orangeWon = orangeGoals > blueGoals;
                    const blueResult = blueWon ? "WIN" : orangeWon ? "LOSS" : "DRAW";
                    const orangeResult = orangeWon ? "WIN" : blueWon ? "LOSS" : "DRAW";
                    const teams = [
                        {
                            won: blueResult,
                            score: blueGoals,
                            stats: {goals: blueGoals},
                            players: data.blue.players.map(p => ({
                                name: p.name,
                                stats: {goals: p.stats.core.goals},
                            })),
                        },
                        {
                            won: orangeResult,
                            score: orangeGoals,
                            stats: {goals: orangeGoals},
                            players: data.orange.players.map(p => ({
                                name: p.name,
                                stats: {goals: p.stats.core.goals},
                            })),
                        },
                    ];
                    out.games.push({teams});
                    break;
                }
                case Parser.CARBALL: {
                    // Convert carball data to ballchasing format first
                    const ballchasingData = this.carballConverter.convertToBallchasingFormat(
                        data,
                        `carball-stats-${Math.random()}`,
                    );

                    // teams = [blue, orange]
                    const blueGoals = ballchasingData.blue.stats.core.goals;
                    const orangeGoals = ballchasingData.orange.stats.core.goals;
                    const blueWon = blueGoals > orangeGoals;
                    const orangeWon = orangeGoals > blueGoals;
                    const blueResult = blueWon ? "WIN" : orangeWon ? "LOSS" : "DRAW";
                    const orangeResult = orangeWon ? "WIN" : blueWon ? "LOSS" : "DRAW";
                    const teams = [
                        {
                            won: blueResult,
                            score: blueGoals,
                            stats: {goals: blueGoals},
                            players: ballchasingData.blue.players.map(p => ({
                                name: p.name,
                                stats: {goals: p.stats.core.goals},
                            })),
                        },
                        {
                            won: orangeResult,
                            score: orangeGoals,
                            stats: {goals: orangeGoals},
                            players: ballchasingData.orange.players.map(p => ({
                                name: p.name,
                                stats: {goals: p.stats.core.goals},
                            })),
                        },
                    ];
                    out.games.push({teams});
                    break;
                }
                default:
                    throw new Error(`Parser ${parser} is not supported!`);
            }
        }

        return out;
    }
}
