import { BaseEntity } from '../base.entity';
import { Column, Entity } from 'typeorm';

@Entity('franchise', { schema: 'sprocket' })
export class FranchiseEntity extends BaseEntity {
  @Column()
  franchise_name: string;
}
