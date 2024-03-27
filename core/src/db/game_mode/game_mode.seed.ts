import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { GameEntity } from '../game/game.entity';
import { EntityManager } from 'typeorm';
import { GameModeEntity } from './game_mode.entity';

@Injectable()
@Seed()
export class GameModeEntitySeed implements Seeder {
  async seed(em: EntityManager) {
    const rocketLeague = await em.findOneByOrFail(GameEntity, {
      name: 'Rocket League',
    });

    const doubles = em.create(GameModeEntity, {
      name: 'Doubles',
      gameId: rocketLeague.id,
    });

    const standard = em.create(GameModeEntity, {
      name: 'Standard',
      gameId: rocketLeague.id,
    });

    await em.upsert(GameModeEntity, [doubles, standard], {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: {
        name: true,
        gameId: true,
      },
    });
  }
}
