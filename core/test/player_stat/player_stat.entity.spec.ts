import { PlayerStatEntity } from '../../src/db/player_stat/player_stat.entity';
import { PlayerStatRepository } from '../../src/db/player_stat/player_stat.repository';

describe('PlayerStatEntity', () => {
  it('should be defined', () => {
    expect(PlayerStatEntity).toBeDefined();
  });
});

describe('PlayerStatRepository', () => {
  it('should be defined', () => {
    expect(PlayerStatRepository).toBeDefined();
  });
});
