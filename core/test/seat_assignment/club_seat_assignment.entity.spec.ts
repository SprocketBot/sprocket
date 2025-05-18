import { ClubSeatAssignmentEntity } from '../../src/db/seat_assignment/club_seat_assignment.entity';
import { ClubSeatAssignmentRepository } from '../../src/db/seat_assignment/club_seat_assignment.repository';

describe('ClubSeatAssignmentEntity', () => {
  it('should be defined', () => {
    expect(ClubSeatAssignmentEntity).toBeDefined();
  });
});

describe('ClubSeatAssignmentRepository', () => {
  it('should be defined', () => {
    expect(ClubSeatAssignmentRepository).toBeDefined();
  });
});
