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

    const doubles = await em.findOneBy(GameModeEntity, {
      name: 'Doubles',
      gameId: rocketLeague.id,
    });
    if (!doubles) {
      await em.insert(GameModeEntity, {
        name: 'Doubles',
        gameId: rocketLeague.id,
        playerCount: 4,
        teamSize: 2,
      });
    }
    const standard = await em.findOneBy(GameModeEntity, {
      name: 'Standard',
      gameId: rocketLeague.id,
    });
    if (!standard) {
      await em.insert(GameModeEntity, {
        name: 'Standard',
        gameId: rocketLeague.id,
        playerCount: 6,
        teamSize: 3,
      });
    }
  }
}
