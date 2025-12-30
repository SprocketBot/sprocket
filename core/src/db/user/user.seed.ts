import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../internal';

@Injectable()
@Seed()
export class UserEntitySeed implements Seeder {
  async seed(em: EntityManager) {
    await seedUser(
      '.hermod.',
      true,
      'https://cdn.discordapp.com/avatars/232306757697798144/705c4231651c3bcfc929c8d9ce46bd08.png',
    );
    await seedUser('mattdamon', true);
    await seedUser('c0p3x', false);
    await seedUser('gogurtyogurt', false);
    await seedUser('massimo.rl', true);
    await seedUser('fatality_fc', true);
    await seedUser('hobohoppy', true);
    await seedUser('ouiiidsmoker', true);
    await seedUser('ilikepie2151', true);
    await seedUser('nigelthornbrake', true);
    async function seedUser(
      username: string,
      active: boolean,
      avatarUrl?: string,
    ) {
      await em.upsert(
        UserEntity,
        {
          username: username,
          avatarUrl: avatarUrl,
          active: active,
        },
        { conflictPaths: ['username'] },
      );
    }
  }
}
