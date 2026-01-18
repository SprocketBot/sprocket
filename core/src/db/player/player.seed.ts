import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import {
  GameEntity,
  PlayerEntity,
  SkillGroupEntity,
  UserEntity,
} from '../internal';

@Injectable()
@Seed()
export class PlayerEntitySeed implements Seeder {
  async seed(em: EntityManager) {
    const rocketLeagueGame = await em.findOneOrFail(GameEntity, {
      where: { name: 'Rocket League' },
    });

    await seedPlayer('.hermod.', rocketLeagueGame, 'Master League', '15.5');
    await seedPlayer('mattdamon', rocketLeagueGame, 'Champion League', '13.0');
    await seedPlayer('massimo.rl', rocketLeagueGame, 'Premier League', '20.0');
    await seedPlayer('fatality_fc', rocketLeagueGame, 'Master League', '16.5');
    await seedPlayer('hobohoppy', rocketLeagueGame, 'Champion League', '14.5');
    await seedPlayer(
      'ouiiidsmoker',
      rocketLeagueGame,
      'Academy League',
      '11.0',
    );
    await seedPlayer(
      'nigelthornbrake',
      rocketLeagueGame,
      'Academy League',
      '12.0',
    );
    async function seedPlayer(
      username: string,
      game: GameEntity,
      skillGroupName: string,
      salary: string,
    ) {
      const user = await em.findOneOrFail(UserEntity, {
        where: { username: username },
      });
      const skillGroup = await em.findOneOrFail(SkillGroupEntity, {
        where: { name: skillGroupName },
      });
      await em.upsert(
        PlayerEntity,
        {
          user: user,
          game: game,
          skillGroup: skillGroup,
          salary,
        },
        { conflictPaths: ['game', 'user'] },
      );
    }
  }
}
