import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { SkillGroupEntity } from './skill_group.entity';
import { EntityManager } from 'typeorm';
import { GameEntity } from '../game/game.entity';

@Injectable()
@Seed()
export class SkillGroupEntitySeed implements Seeder {
  async seed(em: EntityManager) {
    const game = await em.findOneOrFail(GameEntity, {
      where: { name: 'Rocket League' },
    });
    await em.upsert(
      SkillGroupEntity,
      {
        name: 'Pro League',
        code: 'PRO',
        gameId: game.id,
      },
      { conflictPaths: ['name', 'code', 'gameId'] },
    );
    await em.upsert(
      SkillGroupEntity,
      {
        name: 'Amateur League',
        code: 'AME',
        gameId: game.id,
      },
      { conflictPaths: ['name', 'code', 'gameId'] },
    );
  }
}
