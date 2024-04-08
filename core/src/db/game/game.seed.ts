import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { GameEntity } from './game.entity';
import { EntityManager } from 'typeorm';

@Injectable()
@Seed()
export class GameEntitySeed implements Seeder {
  async seed(em: EntityManager) {
    await em.upsert(
      GameEntity,
      {
        name: 'Rocket League',
      },
      { conflictPaths: ['name'] },
    );
  }
}
