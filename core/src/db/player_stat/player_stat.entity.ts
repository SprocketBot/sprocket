import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('player_stat', { schema: 'sprocket' })
export class PlayerStatEntity extends BaseEntity {}
