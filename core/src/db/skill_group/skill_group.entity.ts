import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { GameEntity } from '../game/game.entity';

@Entity('skill_group', { schema: 'sprocket' })
export class SkillGroupEntity extends BaseEntity {
  @ManyToOne(() => GameEntity, (ge) => ge.skillGroups)
  game?: Promise<GameEntity>;
  @Column()
  gameId: string;
}
