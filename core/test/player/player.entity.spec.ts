import { PlayerEntity } from '../../src/db/player/player.entity';
import { PlayerRepository } from '../../src/db/player/player.repository';

describe('PlayerEntity', () => {
  it('should be defined', () => {
    expect(PlayerEntity).toBeDefined();
  });
});

describe('PlayerRepository', () => {
  it('should be defined', () => {
    expect(PlayerRepository).toBeDefined();
  });
});
