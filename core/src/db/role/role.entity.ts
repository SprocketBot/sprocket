import { BaseEntity } from '../internal';
import { Column, Entity } from 'typeorm';

@Entity('role', { schema: 'sprocket' })
export class RoleEntity extends BaseEntity {
	@Column({ unique: true })
	name: string;
}
