import { ClubEntity } from '../../src/db/club/club.entity';
import { ClubRepository } from '../../src/db/club/club.repository';

describe('ClubEntity', () => {
  it('should be defined', () => {
    expect(ClubEntity).toBeDefined();
  });
});

describe('ClubRepository', () => {
  it('should be defined', () => {
    expect(ClubRepository).toBeDefined();
  });
});
