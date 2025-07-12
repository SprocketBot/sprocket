import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { AuthPlatform } from '@sprocketbot/lib/types';
import { BaseEntity, UserEntity } from '../internal';

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
	user: UserEntity;
}
