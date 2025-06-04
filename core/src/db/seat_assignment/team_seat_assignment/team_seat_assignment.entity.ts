import { TeamEntity } from '../../team/team.entity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseSeatAssignmentEntity } from '../base_seat_assignment.entity';

@Entity('team_seat_assignment', { schema: 'sprocket' })
export class TeamSeatAssignmentEntity extends BaseSeatAssignmentEntity {
	@OneToOne(() => TeamEntity)
	@JoinColumn()
	team: TeamEntity;
}
