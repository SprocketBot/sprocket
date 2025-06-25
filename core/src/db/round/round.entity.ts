import { BaseEntity } from '../internal';
import { Entity } from 'typeorm';

@Entity('round', { schema: 'sprocket' })
export class RoundEntity extends BaseEntity {}
