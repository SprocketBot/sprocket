import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('role', { schema: 'sprocket' })
export class RoleEntity extends BaseEntity {
  name: string;
}
