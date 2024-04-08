import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { GameEntity } from '../game/game.entity';

@Entity('skill_group', { schema: 'sprocket' })
@Unique(['name', 'code', 'gameId'])
export class SkillGroupEntity extends BaseEntity {
  @Column()
  name: string;
  @Column()
  code: string;
  @ManyToOne(() => GameEntity, (ge) => ge.skillGroups)
  game?: Promise<GameEntity>;
  @Column()
  gameId: string;
}
