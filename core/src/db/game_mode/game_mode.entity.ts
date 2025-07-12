import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity, GameEntity } from '../internal';

@Entity('game_mode', { schema: 'sprocket' })
@Unique('game-name-unq', ['game', 'name'])
export class GameModeEntity extends BaseEntity {
	@ManyToOne(() => GameEntity, (ge) => ge.gameModes)
	game?: GameEntity;

	@Column()
	name: string;

	@Column()
	playerCount: number;

	@Column()
	teamSize: number;
}
