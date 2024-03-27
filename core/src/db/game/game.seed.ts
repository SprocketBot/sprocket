import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { GameEntity } from './game.entity';
import { EntityManager } from 'typeorm';

@Injectable()
@Seed()
export class GameEntitySeed implements Seeder {
  async seed(em: EntityManager) {
    if (
      (await em.count(GameEntity, {
        where: {
          name: 'Rocket League',
        },
      })) > 0
    )
      return;
    const entity = em.create(GameEntity, {
      name: 'Rocket League',
    });

    await em.save(entity);
  }
}
