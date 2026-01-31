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
                    const blueWon = data.blue.stats.core.goals > data.orange.stats.core.goals;
                    const teams = [
                        {
                            won: blueWon,
                            score: data.blue.stats.core.goals,
                            players: data.blue.players.map(p => ({
                                name: p.name,
                                goals: p.stats.core.goals,
                            })),
                        },
                        {
                            won: !blueWon,
                            score: data.orange.stats.core.goals,
                            players: data.orange.players.map(p => ({
                                name: p.name,
                                goals: p.stats.core.goals,
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
                    const blueWon = ballchasingData.blue.stats.core.goals > ballchasingData.orange.stats.core.goals;
                    const teams = [
                        {
                            won: blueWon,
                            score: ballchasingData.blue.stats.core.goals,
                            players: ballchasingData.blue.players.map(p => ({
                                name: p.name,
                                goals: p.stats.core.goals,
                            })),
                        },
                        {
                            won: !blueWon,
                            score: ballchasingData.orange.stats.core.goals,
                            players: ballchasingData.orange.players.map(p => ({
                                name: p.name,
                                goals: p.stats.core.goals,
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
