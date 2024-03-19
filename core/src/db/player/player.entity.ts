import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('player')
export class PlayerEntity extends BaseEntity {}
