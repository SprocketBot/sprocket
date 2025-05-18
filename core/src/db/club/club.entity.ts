import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('club', { schema: 'sprocket' })
export class ClubEntity extends BaseEntity {}
