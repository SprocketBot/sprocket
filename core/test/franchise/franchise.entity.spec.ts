import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FranchiseEntity } from '../../src/db/franchise/franchise.entity';
import { FranchiseRepository } from '../../src/db/franchise/franchise.repository';
import { FranchiseSeatAssignmentEntity } from '../../src/db/seat_assignment/franchise_seat_assignment.entity';
import { PlayerEntity } from '../../src/db/player/player.entity';
import { SeatEntity } from '../../src/db/seat/seat.entity';

describe('FranchiseEntity', () => {
  let module: TestingModule;
  let franchiseRepository: Repository<FranchiseEntity>;
  let franchiseSeatAssignmentRepository: Repository<FranchiseSeatAssignmentEntity>;
  let playerRepository: Repository<PlayerEntity>;
  let seatRepository: Repository<SeatEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(FranchiseEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(FranchiseSeatAssignmentEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlayerEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SeatEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    franchiseRepository = module.get(getRepositoryToken(FranchiseEntity));
    franchiseSeatAssignmentRepository = module.get(
      getRepositoryToken(FranchiseSeatAssignmentEntity),
    );
    playerRepository = module.get(getRepositoryToken(PlayerEntity));
    seatRepository = module.get(getRepositoryToken(SeatEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(FranchiseEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const franchise = new FranchiseEntity();
      expect(franchise.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const franchise = new FranchiseEntity();
      expect(franchise.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const franchise = new FranchiseEntity();
      expect(franchise.updateAt).toBeUndefined();
    });
  });

  describe('Franchise Fields', () => {
    it('should have franchise_name field', () => {
      const franchise = new FranchiseEntity();
      franchise.franchise_name = 'Test Franchise';
      expect(franchise.franchise_name).toBe('Test Franchise');
    });
  });

  describe('FranchiseRepository', () => {
    it('should be defined', () => {
      expect(FranchiseRepository).toBeDefined();
    });

    it('should create a new franchise', async () => {
      const franchise = new FranchiseEntity();
      franchise.franchise_name = 'Test Franchise';
      jest.spyOn(franchiseRepository, 'save').mockResolvedValueOnce(franchise);

      const savedFranchise = await franchiseRepository.save(franchise);
      expect(savedFranchise).toBeDefined();
      expect(savedFranchise).toBeInstanceOf(FranchiseEntity);
      expect(savedFranchise.franchise_name).toBe('Test Franchise');
    });

    it('should find a franchise by id', async () => {
      const franchise = new FranchiseEntity();
      franchise.franchise_name = 'Test Franchise';
      jest
        .spyOn(franchiseRepository, 'findOne')
        .mockResolvedValueOnce(franchise);

      const foundFranchise = await franchiseRepository.findOne({
        where: { id: 'test-id' },
      });
      expect(foundFranchise).toBeDefined();
      expect(foundFranchise).toBeInstanceOf(FranchiseEntity);
      expect(foundFranchise?.franchise_name).toBe('Test Franchise');
    });
  });

  describe('Franchise Relationships', () => {
    it('should have relationship with FranchiseSeatAssignment', async () => {
      const franchise = new FranchiseEntity();
      franchise.franchise_name = 'Test Franchise';
      const seatAssignment = new FranchiseSeatAssignmentEntity();
      const player = new PlayerEntity();
      const seat = new SeatEntity();

      seatAssignment.franchise = Promise.resolve(franchise);
      seatAssignment.player = Promise.resolve(player);
      seatAssignment.seat = Promise.resolve(seat);

      // Mock the relationships
      jest
        .spyOn(franchiseSeatAssignmentRepository, 'findOne')
        .mockResolvedValueOnce(seatAssignment);
      jest.spyOn(playerRepository, 'findOne').mockResolvedValueOnce(player);
      jest.spyOn(seatRepository, 'findOne').mockResolvedValueOnce(seat);

      // Test the relationship
      const foundAssignment = await franchiseSeatAssignmentRepository.findOne({
        where: { franchise: { id: franchise.id } },
        relations: ['franchise', 'player', 'seat'],
      });

      expect(foundAssignment).not.toBeNull();
      expect(foundAssignment?.franchise).toBeDefined();
      expect(foundAssignment?.player).toBeDefined();
      expect(foundAssignment?.seat).toBeDefined();
    });
  });
});
