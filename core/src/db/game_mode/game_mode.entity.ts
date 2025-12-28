import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';

@Entity('game_mode', { schema: 'sprocket' })
@Unique('game-name-unq', ['game', 'name'])
export class GameModeEntity extends BaseEntity {
	@ManyToOne(() => GameEntity, (ge) => ge.gameModes)
	game?: any;

	@Column()
	name: string;

	@Column()
	playerCount: number;

	@Column()
	teamSize: number;
}
