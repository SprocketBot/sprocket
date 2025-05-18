import { GameEntity } from '../../src/db/game/game.entity';
import { GameRepository } from '../../src/db/game/game.repository';

describe('GameEntity', () => {
  it('should be defined', () => {
    expect(GameEntity).toBeDefined();
  });
});

describe('GameRepository', () => {
  it('should be defined', () => {
    expect(GameRepository).toBeDefined();
  });
});
