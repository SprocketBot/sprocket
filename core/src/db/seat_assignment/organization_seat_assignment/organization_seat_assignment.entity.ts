import { Entity } from 'typeorm';
import { BaseSeatAssignmentEntity } from '../../internal';

@Entity('organization_seat_assignment', { schema: 'sprocket' })
export class OrganizationSeatAssignmentEntity extends BaseSeatAssignmentEntity {}
