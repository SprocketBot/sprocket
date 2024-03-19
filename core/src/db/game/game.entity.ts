import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('game', { schema: 'sprocket' })
export class GameEntity extends BaseEntity {}
