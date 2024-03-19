import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('franchise', { schema: 'sprocket' })
export class FranchiseEntity extends BaseEntity {}
