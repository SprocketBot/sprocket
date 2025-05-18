import { BaseEntity } from '../base.entity';
import { PlayerEntity } from '../player/player.entity';
import { SeatEntity } from '../seat/seat.entity';
import { TeamEntity } from '../team/team.entity';
import { Entity, OneToOne } from 'typeorm';

@Entity('team_seat_assignment', { schema: 'sprocket' })
export class TeamSeatAssignmentEntity extends BaseEntity {
  @OneToOne(() => SeatEntity)
  seat: Promise<SeatEntity>;

  @OneToOne(() => PlayerEntity)
  player: Promise<PlayerEntity>;

  @OneToOne(() => TeamEntity)
  team: Promise<TeamEntity>;
}
