import { SeatEntity } from '../../src/db/seat/seat.entity';
import { SeatRepository } from '../../src/db/seat/seat.repository';

describe('SeatEntity', () => {
  it('should be defined', () => {
    expect(SeatEntity).toBeDefined();
  });
});

describe('SeatRepository', () => {
  it('should be defined', () => {
    expect(SeatRepository).toBeDefined();
  });
});
