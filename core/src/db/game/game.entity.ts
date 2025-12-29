import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { GameModeEntity } from '../game_mode/game_mode.entity';
import type { GameModeEntity as GameModeEntityType } from '../game_mode/game_mode.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';
import type { SkillGroupEntity as SkillGroupEntityType } from '../skill_group/skill_group.entity';

@Entity('game', { schema: 'sprocket' })
export class GameEntity extends BaseEntity {
	@OneToMany(() => GameModeEntity, (gme) => gme.game)
	gameModes?: GameModeEntityType[];

	@OneToMany(() => SkillGroupEntity, (sge) => sge.game)
	skillGroups: SkillGroupEntityType[];

    @Column({ unique: true })
    name: string;

    @Column({ type: 'jsonb', default: {} })
    statDefinitions: Record<string, any>;
}
