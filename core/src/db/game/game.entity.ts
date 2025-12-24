import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity, GameModeEntity, SkillGroupEntity } from '../internal';

@Entity('game', { schema: 'sprocket' })
export class GameEntity extends BaseEntity {
	@OneToMany(() => GameModeEntity, (gme) => gme.game)
	gameModes?: GameModeEntity[];

	@OneToMany(() => SkillGroupEntity, (sge) => sge.game)
	skillGroups: SkillGroupEntity[];

    @Column({ unique: true })
    name: string;

    @Column({ type: 'jsonb', default: {} })
    statDefinitions: Record<string, any>;
}
