import { BaseEntity, GameEntity, SkillGroupEntity, UserEntity } from '../internal';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('player', { schema: 'sprocket' })
export class PlayerEntity extends BaseEntity {
	@ManyToOne(() => UserEntity)
	user: UserEntity;

	@ManyToOne(() => GameEntity)
	game: GameEntity;

	@ManyToOne(() => SkillGroupEntity)
	skillGroup: SkillGroupEntity;

	@Column()
	salary: string;
}
