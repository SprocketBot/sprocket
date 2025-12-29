import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';
import type { GameEntity as GameEntityType } from '../game/game.entity';

@Entity('skill_group', { schema: 'sprocket' })
@Unique(['name', 'code', 'game'])
export class SkillGroupEntity extends BaseEntity {
	@Column()
	name: string;

	@Column()
	code: string;

	@ManyToOne(() => GameEntity, (ge) => ge.skillGroups)
	game: GameEntityType;

	@Column({ type: 'int', default: 0 })
	rank: number; // For ordering (1 = highest)

	@Column({ type: 'boolean', default: true })
	isActive: boolean;
}
