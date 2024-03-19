import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('round', { schema: 'sprocket' })
export class RoundEntity extends BaseEntity {}
