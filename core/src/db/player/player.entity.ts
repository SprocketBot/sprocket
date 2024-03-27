import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { GameEntity } from '../game/game.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';

@Entity('player', { schema: 'sprocket' })
export class PlayerEntity extends BaseEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity | Promise<UserEntity>;
  @Column('string')
  userId: string;

  @ManyToOne(() => GameEntity)
  game: GameEntity | Promise<GameEntity>;
  @Column('string')
  gameId: string;

  @ManyToOne(() => SkillGroupEntity)
  skillGroup: SkillGroupEntity | Promise<SkillGroupEntity>;
  @Column('string')
  skillGroupId: string;
}
