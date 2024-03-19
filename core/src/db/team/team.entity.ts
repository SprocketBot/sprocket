import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('team', { schema: 'sprocket' })
export class TeamEntity extends BaseEntity {}
