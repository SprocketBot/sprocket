import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { AuthPlatform } from '@sprocketbot/lib/types';
import { UserEntity } from '../user/user.entity';

@Entity('user_auth_account', { schema: 'sprocket' })
export class UserAuthAccountEntity extends BaseEntity {
  @Column({ type: 'enum', enum: AuthPlatform })
  platform: AuthPlatform;

  @Column()
  platformId: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (ue) => ue.accounts, { lazy: true })
  user: Promise<UserEntity> | UserEntity;
}
