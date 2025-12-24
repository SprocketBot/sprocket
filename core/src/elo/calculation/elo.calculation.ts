import {
    CalculationStrategy,
    RatingCalculationResult,
} from './calculation-strategy.interface';
import { MatchEntity } from '../../db/match/match.entity';
import { EloRatingNodeEntity } from '../../db/elo/elo-rating-node.entity';
import { GameRatingConfigEntity } from '../../db/elo/game-rating-config.entity';

interface TeamData {
    players: EloRatingNodeEntity[];
    averageRating: number;
    won: boolean;
}

export class EloCalculation implements CalculationStrategy {
    /**
     * Calculate expected score for a player against an opponent rating
     * E = 1 / (1 + 10^((R_opponent - R_player) / 400))
     */
    private calculateExpectedScore(playerRating: number, opponentRating: number): number {
        return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    }

    /**
     * Calculate uncertainty-adjusted K-factor using Glicko-inspired approach
     * Higher uncertainty (RD) -> Higher K for faster convergence
     * Lower uncertainty -> Lower K for stability
     */
    private calculateAdjustedK(
        baseK: number,
        uncertainty: number | undefined,
        minUncertainty: number = 50,
        maxUncertainty: number = 350,
    ): number {
        if (!uncertainty) {
            return baseK;
        }

        // Normalize uncertainty to 0-1 range
        const normalizedUncertainty = Math.min(
            Math.max((uncertainty - minUncertainty) / (maxUncertainty - minUncertainty), 0),
            1,
        );

        // Scale K from 0.5x to 2x based on uncertainty
        // High uncertainty (new players) -> K * 2
        // Low uncertainty (established) -> K * 0.5
        return baseK * (0.5 + 1.5 * normalizedUncertainty);
    }

    /**
     * Extract teams from match rounds
     * Returns two teams with their players and average ratings
     */
    private extractTeams(
        match: MatchEntity,
        inputRatings: EloRatingNodeEntity[],
    ): TeamData[] {
        if (!match.rounds || match.rounds.length === 0) {
            throw new Error('Match has no rounds');
        }

        // Use first round to determine team composition
        const firstRound = match.rounds[0];
        if (!firstRound.teamStats || firstRound.teamStats.length < 2) {
            throw new Error('Round must have at least 2 teams');
        }

        // Group players by team using PlayerStats
        const teamMap = new Map<string, EloRatingNodeEntity[]>();
        
        for (const round of match.rounds) {
            if (!round.playerStats) continue;

            for (const playerStat of round.playerStats) {
                // Find the corresponding rating node
                const ratingNode = inputRatings.find(
                    r => r.player.id === playerStat.player.id
                );
                if (!ratingNode) continue;

                // Determine team from stats (assuming team identifier is in stats JSONB)
                const teamId = String(playerStat.stats.team || 'unknown');
                if (!teamMap.has(teamId)) {
                    teamMap.set(teamId, []);
                }
                
                const team = teamMap.get(teamId)!;
                if (!team.some(p => p.player.id === ratingNode.player.id)) {
                    team.push(ratingNode);
                }
            }
        }

        // Convert to array and calculate team averages
        const teams: TeamData[] = [];
        let teamIndex = 0;
        
        for (const [teamId, players] of teamMap.entries()) {
            if (players.length === 0) continue;

            const averageRating = players.reduce((sum, p) => sum + p.rating, 0) / players.length;
            
            // Determine if team won (check first round's team stats)
            const teamStat = firstRound.teamStats.find(ts => {
                const statsTeamId = String(ts.stats.teamId || '');
                const tsTeamId = ts.team?.id || '';
                return statsTeamId === teamId || tsTeamId === teamId;
            });
            const opponentStat = firstRound.teamStats.find(ts => ts !== teamStat);
            const won = (teamStat?.stats.score || 0) > (opponentStat?.stats.score || 0);

            teams.push({
                players,
                averageRating,
                won: won || teamIndex === 0, // Fallback: first team wins if can't determine
            });
            teamIndex++;
        }

        if (teams.length < 2) {
            throw new Error('Must have at least 2 teams');
        }

        return teams;
    }

    calculate(
        match: MatchEntity,
        inputRatings: EloRatingNodeEntity[],
        config: GameRatingConfigEntity,
    ): RatingCalculationResult {
        const baseK = config.parameters.kFactor || 32;
        const result: RatingCalculationResult = {};

        try {
            const teams = this.extractTeams(match, inputRatings);

            // Calculate rating changes for each player
            for (const team of teams) {
                // Find opponent team(s)
                const opponentTeams = teams.filter(t => t !== team);
                const opponentAverageRating = 
                    opponentTeams.reduce((sum, t) => sum + t.averageRating, 0) / opponentTeams.length;

                const actualScore = team.won ? 1 : 0;

                for (const playerNode of team.players) {
                    const expectedScore = this.calculateExpectedScore(
                        playerNode.rating,
                        opponentAverageRating
                    );

                    // Apply uncertainty-adjusted K-factor
                    const adjustedK = this.calculateAdjustedK(
                        baseK,
                        playerNode.uncertainty
                    );

                    const ratingChange = adjustedK * (actualScore - expectedScore);
                    const newRating = playerNode.rating + ratingChange;

                    // Decay uncertainty slightly (converges toward minimum over time)
                    const newUncertainty = playerNode.uncertainty 
                        ? Math.max(50, playerNode.uncertainty * 0.95)
                        : undefined;

                    result[playerNode.player.id] = {
                        rating: newRating,
                        uncertainty: newUncertainty,
                    };
                }
            }
        } catch (error) {
            // Fallback: no rating change if extraction fails
            for (const input of inputRatings) {
                result[input.player.id] = {
                    rating: input.rating,
                    uncertainty: input.uncertainty,
                };
            }
        }

        return result;
    }
}
