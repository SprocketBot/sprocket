import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { GameEntity } from '../game/game.entity';
import type { SkillGroupObject } from '../../gql/skill_group/skill_group.object';
import type { DataOnly } from '../../gql/types';

@Entity('skill_group', { schema: 'sprocket' })
@Unique(['name', 'code', 'gameId'])
export class SkillGroupEntity extends BaseEntity<SkillGroupObject> {
  @Column()
  name: string;
  @Column()
  code: string;
  @ManyToOne(() => GameEntity, (ge) => ge.skillGroups)
  game?: Promise<GameEntity>;
  @Column()
  gameId: string;

  toObject(): DataOnly<SkillGroupObject> {
    throw new Error();
  }
}
