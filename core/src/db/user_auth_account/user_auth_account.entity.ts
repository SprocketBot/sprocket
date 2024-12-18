import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { AuthPlatform } from '@sprocketbot/lib/types';
import { UserEntity } from '../user/user.entity';
import { UserAuthAccountObject } from '../../gql/user_auth_account/user_auth_account.object';
import { DataOnly } from '../../gql/types';

@Entity('user_auth_account', { schema: 'sprocket' })
@Unique('unique_auth_account', ['platform', 'platformId'])
export class UserAuthAccountEntity extends BaseEntity<UserAuthAccountObject> {
  @Column({ type: 'enum', enum: AuthPlatform })
  platform: AuthPlatform;

  @Column()
  platformId: string;

  @Column()
  platformName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (ue) => ue.accounts)
  user: Promise<UserEntity>;

  toObject(): DataOnly<UserAuthAccountObject> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      avatarUrl: this.avatarUrl,
      platform: this.platform,
      platformId: this.platformId,
      platformName: this.platformName,
      userId: this.userId,
    };
  }
}
