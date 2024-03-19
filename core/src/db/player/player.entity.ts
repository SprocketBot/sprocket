import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('player', { schema: 'sprocket' })
export class PlayerEntity extends BaseEntity {}
