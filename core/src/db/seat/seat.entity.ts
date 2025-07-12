import { BaseEntity, RoleEntity } from '../internal';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('seat', { schema: 'sprocket' })
export class SeatEntity extends BaseEntity {
	@Column({ unique: true })
	name: string;

	@Column()
	description: string;

	@ManyToOne(() => RoleEntity)
	role: RoleEntity;
}
