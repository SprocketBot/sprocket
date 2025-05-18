import { GameModeEntity } from '../../src/db/game_mode/game_mode.entity';
import { GameModeRepository } from '../../src/db/game_mode/game_mode.repository';

describe('GameModeEntity', () => {
  it('should be defined', () => {
    expect(GameModeEntity).toBeDefined();
  });
});

describe('GameModeRepository', () => {
  it('should be defined', () => {
    expect(GameModeRepository).toBeDefined();
  });
});
