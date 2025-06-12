import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseSeatAssignmentEntity, FranchiseEntity } from '../../internal';

@Entity('franchise_seat_assignment', { schema: 'sprocket' })
export class FranchiseSeatAssignmentEntity extends BaseSeatAssignmentEntity {
	@ManyToOne(() => FranchiseEntity)
	@JoinColumn()
	franchise: FranchiseEntity;
}
