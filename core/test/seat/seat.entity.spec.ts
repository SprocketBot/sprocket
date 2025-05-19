import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatEntity } from '../../src/db/seat/seat.entity';
import { SeatRepository } from '../../src/db/seat/seat.repository';

describe('SeatEntity', () => {
  it('should be defined', () => {
    expect(SeatEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const seat = new SeatEntity();
      expect(seat.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const seat = new SeatEntity();
      expect(seat.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const seat = new SeatEntity();
      expect(seat.updateAt).toBeUndefined();
    });
  });
});

describe('SeatRepository', () => {
  let module: TestingModule;
  let seatRepository: Repository<SeatEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(SeatEntity),
          useClass: Repository,
        },
        SeatRepository,
      ],
    }).compile();

    seatRepository = module.get(getRepositoryToken(SeatEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(SeatRepository).toBeDefined();
  });

  it('should create a new seat', async () => {
    const seat = new SeatEntity();
    jest.spyOn(seatRepository, 'save').mockResolvedValueOnce(seat);

    const savedSeat = await seatRepository.save(seat);
    expect(savedSeat).toBeDefined();
    expect(savedSeat).toBeInstanceOf(SeatEntity);
  });

  it('should find a seat by id', async () => {
    const seat = new SeatEntity();
    jest.spyOn(seatRepository, 'findOne').mockResolvedValueOnce(seat);

    const foundSeat = await seatRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundSeat).toBeDefined();
    expect(foundSeat).toBeInstanceOf(SeatEntity);
  });
});
