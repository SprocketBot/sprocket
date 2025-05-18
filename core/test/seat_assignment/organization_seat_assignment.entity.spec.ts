import { OrganizationSeatAssignmentEntity } from '../../src/db/seat_assignment/organization_seat_assignment.entity';
import { OrganizationSeatAssignmentRepository } from '../../src/db/seat_assignment/organization_seat_assignment.repository';

describe('OrganizationSeatAssignmentEntity', () => {
  it('should be defined', () => {
    expect(OrganizationSeatAssignmentEntity).toBeDefined();
  });
});

describe('OrganizationSeatAssignmentRepository', () => {
  it('should be defined', () => {
    expect(OrganizationSeatAssignmentRepository).toBeDefined();
  });
});
