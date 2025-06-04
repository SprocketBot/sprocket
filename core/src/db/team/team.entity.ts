import { BaseEntity } from '../base.entity';
import { Entity, ManyToOne } from 'typeorm';
import { ClubEntity } from '../club/club.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';

@Entity('team', { schema: 'sprocket' })
export class TeamEntity extends BaseEntity {
	@ManyToOne(() => ClubEntity)
	club: ClubEntity;

	@ManyToOne(() => SkillGroupEntity)
	skillGroup: SkillGroupEntity;
}
