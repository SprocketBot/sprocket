import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity, GameEntity } from '../internal';

@Entity('skill_group', { schema: 'sprocket' })
@Unique(['name', 'code', 'game'])
export class SkillGroupEntity extends BaseEntity {
	@Column()
	name: string;
	@Column()
	code: string;
	@ManyToOne(() => GameEntity, (ge) => ge.skillGroups)
	game: GameEntity;
}
