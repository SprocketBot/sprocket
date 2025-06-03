import { FranchiseEntity } from '../../franchise/franchise.entity';
import { Entity, OneToOne } from 'typeorm';
import { BaseSeatAssignmentEntity } from './../base_seat_assignment.entity';

@Entity('franchise_seat_assignment', { schema: 'sprocket' })
export class FranchiseSeatAssignmentEntity extends BaseSeatAssignmentEntity {
	@OneToOne(() => FranchiseEntity)
	franchise: Promise<FranchiseEntity>;
}
