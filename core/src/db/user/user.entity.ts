import { User } from '@sprocketbot/lib/types';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity, PlayerEntity, UserAuthAccountEntity } from '../internal';

@Entity('user', { schema: 'sprocket' })
export class UserEntity extends BaseEntity implements Omit<User, 'allowedActions'> {
	@Column({ unique: true })
	username: string;

	@Column({ nullable: true })
	avatarUrl: string;

	@Column({ default: false })
	active: boolean;

	@OneToMany(() => UserAuthAccountEntity, (uaae) => uaae.user)
	accounts: UserAuthAccountEntity[];

	@OneToMany(() => PlayerEntity, (pe) => pe.user)
	players: PlayerEntity[];
}
