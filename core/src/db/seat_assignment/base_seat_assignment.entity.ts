import { BaseEntity } from '../base.entity';
import { SeatEntity } from '../seat/seat.entity';
import { OneToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';

export abstract class BaseSeatAssignmentEntity extends BaseEntity {
	@OneToOne(() => SeatEntity)
	seat: Promise<SeatEntity>;

	@OneToOne(() => UserEntity)
	user: Promise<UserEntity>;
}
