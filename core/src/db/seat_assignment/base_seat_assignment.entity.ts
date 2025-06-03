import { BaseEntity, OneToOne, PrimaryColumn } from 'typeorm';
import { SeatEntity } from '../seat/seat.entity';
import { UserEntity } from '../user/user.entity';

export class BaseSeatAssignmentEntity extends BaseEntity {
	@PrimaryColumn()
	id: string;
	@OneToOne(() => SeatEntity)
	seat: Promise<SeatEntity>;

	@OneToOne(() => UserEntity)
	user: Promise<UserEntity>;
}
