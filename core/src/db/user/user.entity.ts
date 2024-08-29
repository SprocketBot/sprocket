import { User } from '@sprocketbot/lib/types';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserAuthAccountEntity } from '../user_auth_account/user_auth_account.entity';
import { PlayerEntity } from '../player/player.entity';
import type { UserObject } from '../../gql/user/user.object';
import { DataOnly } from '../../gql/types';

@Entity('user', { schema: 'sprocket' })
export class UserEntity
  extends BaseEntity<UserObject>
  implements Omit<User, 'allowedActions'>
{
  @Column()
  username: string;

  @Column()
  avatarUrl: string;

  @Column({ default: false })
  active: boolean;

  @OneToMany(() => UserAuthAccountEntity, (uaae) => uaae.user)
  accounts: Promise<UserAuthAccountEntity[]>;

  @OneToMany(() => PlayerEntity, (pe) => pe.user)
  players: Promise<PlayerEntity[]>;

  toObject(): DataOnly<UserObject> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      username: this.username,
      avatarUrl: this.avatarUrl,
      allowedActions: [],
      active: this.active,
      players: [],
      accounts: [],
    };
  }
}
