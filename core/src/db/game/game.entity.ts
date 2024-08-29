import { BaseEntity } from '../base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { GameModeEntity } from '../game_mode/game_mode.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';
import { DataOnly } from '../../gql/types';
import type { GameObject } from '../../gql/game/game.object';

@Entity('game', { schema: 'sprocket' })
export class GameEntity extends BaseEntity<GameObject> {
  @OneToMany(() => GameModeEntity, (gme) => gme.game)
  gameModes?: Promise<GameModeEntity[]>;

  @OneToMany(() => SkillGroupEntity, (sge) => sge.game)
  skillGroups?: Promise<SkillGroupEntity[]>;

  @Column({ unique: true })
  name: string;

  toObject(): DataOnly<GameObject> {
    throw new Error();
  }
}
