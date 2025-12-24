import { GameRatingConfigEntity } from '../../db/elo/game-rating-config.entity';
import { EloRatingNodeEntity } from '../../db/elo/elo-rating-node.entity';
import { MatchEntity } from '../../db/match/match.entity';

export interface RatingCalculationResult {
    [playerId: string]: {
        rating: number;
        uncertainty?: number;
    };
}

export interface CalculationStrategy {
    calculate(
        match: MatchEntity,
        inputRatings: EloRatingNodeEntity[],
        config: GameRatingConfigEntity,
    ): RatingCalculationResult;
}
