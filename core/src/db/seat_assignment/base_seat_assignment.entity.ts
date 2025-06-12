import { JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity, SeatEntity, UserEntity } from '../internal';

export class BaseSeatAssignmentEntity extends BaseEntity {
	@ManyToOne(() => SeatEntity)
	@JoinColumn()
	seat: SeatEntity;

	@ManyToOne(() => UserEntity)
	@JoinColumn()
	user: UserEntity;
}
