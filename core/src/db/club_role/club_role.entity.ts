import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ClubEntity } from '../club/club.entity';
import type { ClubEntity as ClubEntityType } from '../club/club.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';

export enum ClubRoleType {
	GENERAL_MANAGER = 'general_manager',
	ASSISTANT_GM = 'assistant_gm',
}

@Entity('club_role', { schema: 'sprocket' })
export class ClubRoleEntity extends BaseEntity {
	@ManyToOne(() => ClubEntity, (club) => club.roles)
	club: ClubEntityType;

	@ManyToOne(() => UserEntity)
	user: UserEntityType;

	@Column({ type: 'enum', enum: ClubRoleType })
	roleType: ClubRoleType;

	@Column()
	assignedAt: Date;

	@ManyToOne(() => UserEntity)
	assignedBy: UserEntityType;

	@Column({ type: 'boolean', default: false })
	requiresApproval: boolean;
}
