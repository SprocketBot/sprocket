import { TeamSeatAssignmentEntity } from '../../src/db/seat_assignment/team_seat_assignment.entity';
import { TeamSeatAssignmentRepository } from '../../src/db/seat_assignment/team_seat_assignment.repository';

describe('TeamSeatAssignmentEntity', () => {
  it('should be defined', () => {
    expect(TeamSeatAssignmentEntity).toBeDefined();
  });
});

describe('TeamSeatAssignmentRepository', () => {
  it('should be defined', () => {
    expect(TeamSeatAssignmentRepository).toBeDefined();
  });
});
