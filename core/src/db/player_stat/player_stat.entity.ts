import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('player_stat')
export class PlayerStatEntity extends BaseEntity {}
