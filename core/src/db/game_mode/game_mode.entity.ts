import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('game_mode', { schema: 'sprocket' })
export class GameModeEntity extends BaseEntity {}
