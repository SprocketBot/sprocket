import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TeamEntity } from '../team/team.entity';
import type { TeamEntity as TeamEntityType } from '../team/team.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';

export enum TeamRoleType {
	CAPTAIN = 'captain',
	ASSISTANT_CAPTAIN = 'assistant_captain',
}

@Entity('team_role', { schema: 'sprocket' })
export class TeamRoleEntity extends BaseEntity {
	@ManyToOne(() => TeamEntity, (team) => team.roles)
	team: TeamEntityType;

	@ManyToOne(() => UserEntity)
	user: UserEntityType;

	@Column({ type: 'enum', enum: TeamRoleType })
	roleType: TeamRoleType;

	@Column()
	assignedAt: Date;

	@ManyToOne(() => UserEntity)
	assignedBy: UserEntityType;

	@Column({ type: 'boolean', default: false })
	requiresApproval: boolean;
}
