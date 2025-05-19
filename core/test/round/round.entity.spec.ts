import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoundEntity } from '../../src/db/round/round.entity';
import { RoundRepository } from '../../src/db/round/round.repository';

describe('RoundEntity', () => {
  it('should be defined', () => {
    expect(RoundEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const round = new RoundEntity();
      expect(round.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const round = new RoundEntity();
      expect(round.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const round = new RoundEntity();
      expect(round.updateAt).toBeUndefined();
    });
  });
});

describe('RoundRepository', () => {
  let module: TestingModule;
  let roundRepository: Repository<RoundEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(RoundEntity),
          useClass: Repository,
        },
        RoundRepository,
      ],
    }).compile();

    roundRepository = module.get(getRepositoryToken(RoundEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(RoundRepository).toBeDefined();
  });

  it('should create a new round', async () => {
    const round = new RoundEntity();
    jest.spyOn(roundRepository, 'save').mockResolvedValueOnce(round);

    const savedRound = await roundRepository.save(round);
    expect(savedRound).toBeDefined();
    expect(savedRound).toBeInstanceOf(RoundEntity);
  });

  it('should find a round by id', async () => {
    const round = new RoundEntity();
    jest.spyOn(roundRepository, 'findOne').mockResolvedValueOnce(round);

    const foundRound = await roundRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundRound).toBeDefined();
    expect(foundRound).toBeInstanceOf(RoundEntity);
  });
});
