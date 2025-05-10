import { BaseEntity } from '../base.entity';
import { SeatEntity } from '../seat/seat.entity';
import { FranchiseEntity } from '../franchise/franchise.entity';
import { PlayerEntity } from '../player/player.entity';
import { Entity, OneToOne } from 'typeorm';

@Entity('franchise_seat_assignment', { schema: 'sprocket' })
export class FranchiseSeatAssignmentEntity extends BaseEntity {
  @OneToOne(() => SeatEntity)
  seat: Promise<SeatEntity>;

  @OneToOne(() => PlayerEntity)
  player: Promise<PlayerEntity>;

  @OneToOne(() => FranchiseEntity)
  franchise: Promise<FranchiseEntity>;
}
