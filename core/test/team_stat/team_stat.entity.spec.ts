import { TeamStatEntity } from '../../src/db/team_stat/team_stat.entity';
import { TeamStatRepository } from '../../src/db/team_stat/team_stat.repository';

describe('TeamStatEntity', () => {
  it('should be defined', () => {
    expect(TeamStatEntity).toBeDefined();
  });
});

describe('TeamStatRepository', () => {
  it('should be defined', () => {
    expect(TeamStatRepository).toBeDefined();
  });
});
