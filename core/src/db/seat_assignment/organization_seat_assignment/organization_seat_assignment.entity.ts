import { Entity } from 'typeorm';
import { BaseSeatAssignmentEntity } from '../base_seat_assignment.entity';

@Entity('organization_seat_assignment', { schema: 'sprocket' })
export class OrganizationSeatAssignmentEntity extends BaseSeatAssignmentEntity {}
