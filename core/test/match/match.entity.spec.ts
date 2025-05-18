import { FixtureEntity, MatchEntity, ScrimEntity } from '../../src/db/match/match.entity';
import { FixtureRepository, MatchRepository, ScrimRepository } from '../../src/db/match/match.repository';

describe('MatchEntity', () => {
  it('should be defined', () => {
    expect(MatchEntity).toBeDefined();
  });
});

describe('MatchRepository', () => {
  it('should be defined', () => {
    expect(MatchRepository).toBeDefined();
  });
});

describe('FixtureEntity', () => {
  it('should be defined', () => {
    expect(FixtureEntity).toBeDefined();
  });
});

describe('FixtureRepository', () => {
  it('should be defined', () => {
    expect(FixtureRepository).toBeDefined();
  });
});

describe('ScrimEntity', () => {
  it('should be defined', () => {
    expect(ScrimEntity).toBeDefined();
  });
});

describe('ScrimRepository', () => {
  it('should be defined', () => {
    expect(ScrimRepository).toBeDefined();
  });
});
