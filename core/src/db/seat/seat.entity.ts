import { BaseEntity } from '../base.entity';
import { RoleEntity } from '../role/role.entity';
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
