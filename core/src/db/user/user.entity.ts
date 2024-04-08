import { User } from '@sprocketbot/lib/types';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserAuthAccountEntity } from '../user_auth_account/user_auth_account.entity';
import { PlayerEntity } from '../player/player.entity';

@Entity('user', { schema: 'sprocket' })
export class UserEntity
  extends BaseEntity
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
}
