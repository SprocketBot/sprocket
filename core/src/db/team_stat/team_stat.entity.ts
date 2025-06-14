import { BaseEntity } from '../internal';
import { Entity } from 'typeorm';

@Entity('team_stat', { schema: 'sprocket' })
export class TeamStatEntity extends BaseEntity {}
