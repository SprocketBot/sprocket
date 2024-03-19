import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('game')
export class GameEntity extends BaseEntity {}
