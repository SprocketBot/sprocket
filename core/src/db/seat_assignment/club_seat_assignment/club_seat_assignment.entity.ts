import { Entity, ManyToOne } from 'typeorm';
import { BaseSeatAssignmentEntity, ClubEntity } from '../../internal';

@Entity('club_seat_assignment', { schema: 'sprocket' })
export class ClubSeatAssignmentEntity extends BaseSeatAssignmentEntity {
	@ManyToOne(() => ClubEntity)
	club: ClubEntity;
}
