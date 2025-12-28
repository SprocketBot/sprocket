import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ClubEntity } from '../club/club.entity';
import { UserEntity } from '../user/user.entity';

export enum ClubRoleType {
	GENERAL_MANAGER = 'general_manager',
	ASSISTANT_GM = 'assistant_gm',
}

@Entity('club_role', { schema: 'sprocket' })
export class ClubRoleEntity extends BaseEntity {
	@ManyToOne(() => ClubEntity, (club) => club.roles)
	club: ClubEntity;

	@ManyToOne(() => UserEntity)
	user: UserEntity;

	@Column({ type: 'enum', enum: ClubRoleType })
	roleType: ClubRoleType;

	@Column()
	assignedAt: Date;

	@ManyToOne(() => UserEntity)
	assignedBy: UserEntity;

	@Column({ type: 'boolean', default: false })
	requiresApproval: boolean;
}
