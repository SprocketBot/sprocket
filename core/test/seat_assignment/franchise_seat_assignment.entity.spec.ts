import { FranchiseSeatAssignmentEntity } from '../../src/db/seat_assignment/franchise_seat_assignment.entity';
import { FranchiseSeatAssignmentRepository } from '../../src/db/seat_assignment/franchise_seat_assignment.repository';

describe('FranchiseSeatAssignmentEntity', () => {
  it('should be defined', () => {
    expect(FranchiseSeatAssignmentEntity).toBeDefined();
  });
});

describe('FranchiseSeatAssignmentRepository', () => {
  it('should be defined', () => {
    expect(FranchiseSeatAssignmentRepository).toBeDefined();
  });
});
