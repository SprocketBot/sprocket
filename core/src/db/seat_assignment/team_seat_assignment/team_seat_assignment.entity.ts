import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseSeatAssignmentEntity, TeamEntity } from '../../internal';

@Entity('team_seat_assignment', { schema: 'sprocket' })
export class TeamSeatAssignmentEntity extends BaseSeatAssignmentEntity {
	@ManyToOne(() => TeamEntity)
	@JoinColumn()
	team: TeamEntity;
}
