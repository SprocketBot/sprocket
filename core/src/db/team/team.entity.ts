import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity, ClubEntity, SkillGroupEntity } from '../internal';

@Entity('team', { schema: 'sprocket' })
export class TeamEntity extends BaseEntity {
	@ManyToOne(() => ClubEntity)
	club: ClubEntity;

	@ManyToOne(() => SkillGroupEntity)
	skillGroup: SkillGroupEntity;
}
