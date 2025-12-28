import { BaseEntity } from '../base.entity';
import { Column, Entity } from 'typeorm';

@Entity('role', { schema: 'sprocket' })
export class RoleEntity extends BaseEntity {
	@Column({ unique: true })
	name: string;
}
