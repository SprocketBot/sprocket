import { BaseEntity } from '../base.entity';
import { SeatEntity } from '../seat/seat.entity';
import { ClubEntity } from '../club/club.entity';
import { PlayerEntity } from '../player/player.entity';
import { Entity, OneToOne } from 'typeorm';

@Entity('club_seat_assignment', { schema: 'sprocket' })
export class ClubSeatAssignmentEntity extends BaseEntity {
  @OneToOne(() => SeatEntity)
  seat: Promise<SeatEntity>;

  @OneToOne(() => PlayerEntity)
  player: Promise<PlayerEntity>;

  @OneToOne(() => ClubEntity)
  club: Promise<ClubEntity>;
}
