import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';
import { UserEntity } from '../user/user.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';

@Entity('player', { schema: 'sprocket' })
@Unique(['game', 'user'])
export class PlayerEntity extends BaseEntity {
	@ManyToOne(() => UserEntity)
	user: any;

	@ManyToOne(() => GameEntity)
	game: GameEntity;

	@ManyToOne(() => SkillGroupEntity)
	skillGroup: SkillGroupEntity;

	@Column()
	salary: string;
}
