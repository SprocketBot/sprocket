import { Entity, ManyToOne } from 'typeorm';
import { BaseSeatAssignmentEntity } from '../base_seat_assignment.entity';
import { TeamEntity } from '../../team/team.entity';

@Entity('team_seat_assignment', { schema: 'sprocket' })
export class TeamSeatAssignmentEntity extends BaseSeatAssignmentEntity {
	@ManyToOne(() => TeamEntity)
	team: TeamEntity;
}
