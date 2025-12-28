import { Entity, ManyToOne } from 'typeorm';
import { BaseSeatAssignmentEntity } from '../base_seat_assignment.entity';
import { ClubEntity } from '../../club/club.entity';

@Entity('club_seat_assignment', { schema: 'sprocket' })
export class ClubSeatAssignmentEntity extends BaseSeatAssignmentEntity {
	@ManyToOne(() => ClubEntity)
	club: ClubEntity;
}
