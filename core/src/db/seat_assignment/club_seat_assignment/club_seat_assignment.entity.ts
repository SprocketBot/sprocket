import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { ClubEntity } from '../../club/club.entity';
import { BaseSeatAssignmentEntity } from '../base_seat_assignment.entity';

@Entity('club_seat_assignment', { schema: 'sprocket' })
export class ClubSeatAssignmentEntity extends BaseSeatAssignmentEntity {
	@OneToOne(() => ClubEntity)
	@JoinColumn()
	club: ClubEntity;
}
