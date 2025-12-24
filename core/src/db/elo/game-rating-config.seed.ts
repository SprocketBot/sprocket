import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { GameRatingConfigEntity, RatingSystem } from './game-rating-config.entity';
import { GameEntity } from '../internal';

@Injectable()
@Seed()
export class GameRatingConfigSeed implements Seeder {
    async seed(em: EntityManager) {
        // Find games
        const rocketLeague = await em.findOne(GameEntity, {
            where: { name: 'Rocket League' },
        });

        const trackmania = await em.findOne(GameEntity, {
            where: { name: 'Trackmania' },
        });

        // Rocket League - Standard Elo with uncertainty adjustment
        if (rocketLeague) {
            const existing = await em.findOne(GameRatingConfigEntity, {
                where: { game: { id: rocketLeague.id } },
            });

            if (!existing) {
                await em.save(GameRatingConfigEntity, {
                    game: rocketLeague,
                    system: RatingSystem.ELO,
                    parameters: {
                        kFactor: 32,
                        initialRating: 1000,
                        ratingDeviation: 350, // For uncertainty-adjusted K
                    },
                    isActive: true,
                    effectiveFrom: new Date(),
                });
                console.log('Seeded Rocket League rating config');
            }
        }

        // Trackmania - Placeholder for now
        if (trackmania) {
            const existing = await em.findOne(GameRatingConfigEntity, {
                where: { game: { id: trackmania.id } },
            });

            if (!existing) {
                await em.save(GameRatingConfigEntity, {
                    game: trackmania,
                    system: RatingSystem.ELO,
                    parameters: {
                        kFactor: 32,
                        initialRating: 1000,
                        ratingDeviation: 350,
                    },
                    isActive: true,
                    effectiveFrom: new Date(),
                });
                console.log('Seeded Trackmania rating config');
            }
        }
    }
}
