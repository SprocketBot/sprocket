import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ClubEntity } from '../club/club.entity';
import type { ClubEntity as ClubEntityType } from '../club/club.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';
import type { SkillGroupEntity as SkillGroupEntityType } from '../skill_group/skill_group.entity';
import { RosterSpotEntity } from '../roster_spot/roster_spot.entity';
import type { RosterSpotEntity as RosterSpotEntityType } from '../roster_spot/roster_spot.entity';
import { TeamRoleEntity } from '../team_role/team_role.entity';
import type { TeamRoleEntity as TeamRoleEntityType } from '../team_role/team_role.entity';

@Entity('team', { schema: 'sprocket' })
export class TeamEntity extends BaseEntity {
	@ManyToOne(() => ClubEntity, (c) => c.teams)
	club: ClubEntityType;

	@ManyToOne(() => SkillGroupEntity)
	skillGroup: SkillGroupEntityType;

	@Column()
	name: string;

	@Column({ unique: true })
	slug: string;

	@Column({ type: 'int' })
	rosterSizeLimit: number;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@OneToMany(() => RosterSpotEntity, (rs) => rs.team)
	rosterSpots: RosterSpotEntityType[];

	@OneToMany(() => TeamRoleEntity, (r) => r.team)
	roles: TeamRoleEntityType[];
}
