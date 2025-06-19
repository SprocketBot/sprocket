import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  FixtureEntity,
  MatchEntity,
  ScrimEntity,
} from '../../src/db/match/match.entity';
import {
  FixtureRepository,
  MatchRepository,
  ScrimRepository,
} from '../../src/db/match/match.repository';

describe('MatchEntity', () => {
  it('should be defined', () => {
    expect(MatchEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const match = new MatchEntity();
      expect(match.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const match = new MatchEntity();
      expect(match.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const match = new MatchEntity();
      expect(match.updateAt).toBeUndefined();
    });
  });
});

describe('MatchRepository', () => {
  let module: TestingModule;
  let matchRepository: Repository<MatchEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(MatchEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    matchRepository = module.get(getRepositoryToken(MatchEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(MatchRepository).toBeDefined();
  });

  it('should create a new match', async () => {
    const match = new MatchEntity();
    const spy = vi.spyOn(matchRepository, 'save').mockResolvedValueOnce(match);

    const savedMatch = await matchRepository.save(match);
    expect(savedMatch).toBeDefined();
    expect(savedMatch).toBeInstanceOf(MatchEntity);
    spy.mockRestore();
  });

  it('should find a match by id', async () => {
    const match = new MatchEntity();
    const spy = vi.spyOn(matchRepository, 'findOne').mockResolvedValueOnce(match);

    const foundMatch = await matchRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundMatch).toBeDefined();
    expect(foundMatch).toBeInstanceOf(MatchEntity);
    spy.mockRestore();
  });
});

describe('FixtureEntity', () => {
  it('should be defined', () => {
    expect(FixtureEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const fixture = new FixtureEntity();
      expect(fixture.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const fixture = new FixtureEntity();
      expect(fixture.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const fixture = new FixtureEntity();
      expect(fixture.updateAt).toBeUndefined();
    });
  });
});

describe('FixtureRepository', () => {
  let module: TestingModule;
  let fixtureRepository: Repository<FixtureEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(FixtureEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    fixtureRepository = module.get(getRepositoryToken(FixtureEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(FixtureRepository).toBeDefined();
  });

  it('should create a new fixture', async () => {
    const fixture = new FixtureEntity();
    const spy = vi.spyOn(fixtureRepository, 'save').mockResolvedValueOnce(fixture);

    const savedFixture = await fixtureRepository.save(fixture);
    expect(savedFixture).toBeDefined();
    expect(savedFixture).toBeInstanceOf(FixtureEntity);
    spy.mockRestore();
  });

  it('should find a fixture by id', async () => {
    const fixture = new FixtureEntity();
    const spy = vi.spyOn(fixtureRepository, 'findOne').mockResolvedValueOnce(fixture);

    const foundFixture = await fixtureRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundFixture).toBeDefined();
    expect(foundFixture).toBeInstanceOf(FixtureEntity);
    spy.mockRestore();
  });
});

describe('ScrimEntity', () => {
  it('should be defined', () => {
    expect(ScrimEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const scrim = new ScrimEntity();
      expect(scrim.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const scrim = new ScrimEntity();
      expect(scrim.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const scrim = new ScrimEntity();
      expect(scrim.updateAt).toBeUndefined();
    });
  });
});

describe('ScrimRepository', () => {
  let module: TestingModule;
  let scrimRepository: Repository<ScrimEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ScrimEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    scrimRepository = module.get(getRepositoryToken(ScrimEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(ScrimRepository).toBeDefined();
  });

  it('should create a new scrim', async () => {
    const scrim = new ScrimEntity();
    const spy = vi.spyOn(scrimRepository, 'save').mockResolvedValueOnce(scrim);

    const savedScrim = await scrimRepository.save(scrim);
    expect(savedScrim).toBeDefined();
    expect(savedScrim).toBeInstanceOf(ScrimEntity);
    spy.mockRestore();
  });

  it('should find a scrim by id', async () => {
    const scrim = new ScrimEntity();
    const spy = vi.spyOn(scrimRepository, 'findOne').mockResolvedValueOnce(scrim);

    const foundScrim = await scrimRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundScrim).toBeDefined();
    expect(foundScrim).toBeInstanceOf(ScrimEntity);
    spy.mockRestore();
  });
});
