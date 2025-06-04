import { BaseEntity } from '../base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { GameModeEntity } from '../game_mode/game_mode.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';

@Entity('game', { schema: 'sprocket' })
export class GameEntity extends BaseEntity {
	@OneToMany(() => GameModeEntity, (gme) => gme.game)
	gameModes?: GameModeEntity[];

	@OneToMany(() => SkillGroupEntity, (sge) => sge.game)
	skillGroups: SkillGroupEntity[];

	@Column({ unique: true })
	name: string;
}
