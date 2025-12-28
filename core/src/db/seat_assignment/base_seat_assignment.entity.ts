import { ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { SeatEntity } from '../seat/seat.entity';
import { UserEntity } from '../user/user.entity';

export abstract class BaseSeatAssignmentEntity extends BaseEntity {
	@ManyToOne(() => SeatEntity)
	seat: SeatEntity;

	@ManyToOne(() => UserEntity)
	user: UserEntity;
}
