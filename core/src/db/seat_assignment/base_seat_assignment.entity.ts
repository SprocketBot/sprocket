import { ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { SeatEntity } from '../seat/seat.entity';
import type { SeatEntity as SeatEntityType } from '../seat/seat.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';

export abstract class BaseSeatAssignmentEntity extends BaseEntity {
	@ManyToOne(() => SeatEntity)
	seat: SeatEntityType;

	@ManyToOne(() => UserEntity)
	user: UserEntityType;
}
