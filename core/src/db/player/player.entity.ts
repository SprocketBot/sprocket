import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { GameEntity } from '../game/game.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';

@Entity('player', { schema: 'sprocket' })
export class PlayerEntity extends BaseEntity {
  @ManyToOne(() => UserEntity)
  user: Promise<UserEntity>;
  @Column()
  userId: string;

  @ManyToOne(() => GameEntity)
  game: Promise<GameEntity>;
  @Column()
  gameId: string;

  @ManyToOne(() => SkillGroupEntity)
  skillGroup: Promise<SkillGroupEntity>;

  @Column()
  skillGroupId: string;
}
