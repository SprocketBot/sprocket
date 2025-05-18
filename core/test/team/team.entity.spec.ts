import { TeamEntity } from '../../src/db/team/team.entity';
import { TeamRepository } from '../../src/db/team/team.repository';

describe('TeamEntity', () => {
  it('should be defined', () => {
    expect(TeamEntity).toBeDefined();
  });
});

describe('TeamRepository', () => {
  it('should be defined', () => {
    expect(TeamRepository).toBeDefined();
  });
});
