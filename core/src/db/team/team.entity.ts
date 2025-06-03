import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ClubEntity } from '../club/club.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';

@Entity('team', { schema: 'sprocket' })
export class TeamEntity extends BaseEntity {
	@ManyToOne(() => ClubEntity)
	club: Promise<ClubEntity>;
	@Column()
	clubId: string;

	@ManyToOne(() => SkillGroupEntity)
	skillGroup: Promise<SkillGroupEntity>;
	@Column()
	skillGroupId: string;
}
