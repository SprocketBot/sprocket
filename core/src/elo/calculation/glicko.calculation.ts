import {
    CalculationStrategy,
    RatingCalculationResult,
} from './calculation-strategy.interface';
import { MatchEntity } from '../../db/match/match.entity';
import { EloRatingNodeEntity } from '../../db/elo/elo-rating-node.entity';
import { GameRatingConfigEntity } from '../../db/elo/game-rating-config.entity';

export class GlickoCalculation implements CalculationStrategy {
    calculate(
        match: MatchEntity,
        inputRatings: EloRatingNodeEntity[],
        config: GameRatingConfigEntity,
    ): RatingCalculationResult {
        const result: RatingCalculationResult = {};

        // Placeholder for Glicko-2 implementation
        for (const input of inputRatings) {
            result[input.player.id] = {
                rating: input.rating,
                uncertainty: input.uncertainty,
            };
        }

        return result;
    }
}
