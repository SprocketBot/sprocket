import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { AuthPlatform } from '@sprocketbot/lib/types';
import { BaseEntity } from '../base.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';

@Entity('user_auth_account', { schema: 'sprocket' })
@Unique('unique_auth_account', ['platform', 'platformId'])
export class UserAuthAccountEntity extends BaseEntity {
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
	user: any;
}
