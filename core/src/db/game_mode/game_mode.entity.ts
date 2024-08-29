import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { GameEntity } from '../game/game.entity';
import { DataOnly } from '../../gql/types';
import { GameModeObject } from '../../gql/game_mode/game_mode.object';

@Entity('game_mode', { schema: 'sprocket' })
@Unique('game-name-unq', ['gameId', 'name'])
export class GameModeEntity extends BaseEntity<GameModeObject> {
  @ManyToOne(() => GameEntity, (ge) => ge.gameModes)
  game?: Promise<GameEntity>;

  @Column()
  gameId: string;

  @Column()
  name: string;

  @Column()
  playerCount: number;

  @Column()
  teamSize: number;

  toObject(): DataOnly<GameModeObject> {
    throw new Error();
  }
}
