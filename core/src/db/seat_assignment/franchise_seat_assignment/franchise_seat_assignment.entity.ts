import { Entity, ManyToOne } from 'typeorm';
import { BaseSeatAssignmentEntity } from '../base_seat_assignment.entity';
import { FranchiseEntity } from '../../franchise/franchise.entity';
import type { FranchiseEntity as FranchiseEntityType } from '../../franchise/franchise.entity';

@Entity('franchise_seat_assignment', { schema: 'sprocket' })
export class FranchiseSeatAssignmentEntity extends BaseSeatAssignmentEntity {
	@ManyToOne(() => FranchiseEntity)
	franchise: FranchiseEntityType;
}
