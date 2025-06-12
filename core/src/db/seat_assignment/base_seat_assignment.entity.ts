import { ManyToOne } from 'typeorm';
import { BaseEntity, SeatEntity, UserEntity } from '../internal';

export class BaseSeatAssignmentEntity extends BaseEntity {
	@ManyToOne(() => SeatEntity)
	seat: SeatEntity;

	@ManyToOne(() => UserEntity)
	user: UserEntity;
}
