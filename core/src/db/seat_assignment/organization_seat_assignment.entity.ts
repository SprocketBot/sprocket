import { BaseEntity } from '../base.entity';
import { SeatEntity } from '../seat/seat.entity';
import { UserEntity } from '../user/user.entity';
import { Entity, OneToOne } from 'typeorm';

@Entity('organization_seat_assignment', { schema: 'sprocket' })
export class OrganizationSeatAssignmentEntity extends BaseEntity {
  @OneToOne(() => SeatEntity)
  seat: Promise<SeatEntity>;

  @OneToOne(() => UserEntity)
  user: Promise<UserEntity>;
}
