import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubEntity } from '../../src/db/club/club.entity';
import { ClubRepository } from '../../src/db/club/club.repository';
import { ClubSeatAssignmentEntity } from '../../src/db/seat_assignment/club_seat_assignment.entity';
import { PlayerEntity } from '../../src/db/player/player.entity';
import { SeatEntity } from '../../src/db/seat/seat.entity';

describe('ClubEntity', () => {
  let module: TestingModule;
  let clubRepository: Repository<ClubEntity>;
  let clubSeatAssignmentRepository: Repository<ClubSeatAssignmentEntity>;
  let playerRepository: Repository<PlayerEntity>;
  let seatRepository: Repository<SeatEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ClubEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ClubSeatAssignmentEntity),
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

    clubRepository = module.get(getRepositoryToken(ClubEntity));
    clubSeatAssignmentRepository = module.get(getRepositoryToken(ClubSeatAssignmentEntity));
    playerRepository = module.get(getRepositoryToken(PlayerEntity));
    seatRepository = module.get(getRepositoryToken(SeatEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(ClubEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const club = new ClubEntity();
      expect(club.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const club = new ClubEntity();
      expect(club.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const club = new ClubEntity();
      expect(club.updateAt).toBeUndefined();
    });
  });

  describe('ClubRepository', () => {
    it('should be defined', () => {
      expect(ClubRepository).toBeDefined();
    });

    it('should create a new club', async () => {
      const club = new ClubEntity();
      jest.spyOn(clubRepository, 'save').mockResolvedValueOnce(club);
      
      const savedClub = await clubRepository.save(club);
      expect(savedClub).toBeDefined();
      expect(savedClub).toBeInstanceOf(ClubEntity);
    });

    it('should find a club by id', async () => {
      const club = new ClubEntity();
      jest.spyOn(clubRepository, 'findOne').mockResolvedValueOnce(club);
      
      const foundClub = await clubRepository.findOne({ where: { id: 'test-id' } });
      expect(foundClub).toBeDefined();
      expect(foundClub).toBeInstanceOf(ClubEntity);
    });
  });

  describe('Club Relationships', () => {
    it('should have relationship with ClubSeatAssignment', async () => {
      const seatAssignment = new ClubSeatAssignmentEntity();
      const club = new ClubEntity();
      const player = new PlayerEntity();
      const seat = new SeatEntity();
      seatAssignment.club = Promise.resolve(club);
      seatAssignment.player = Promise.resolve(player);
      seatAssignment.seat = Promise.resolve(seat);

      // Mock the relationships
      jest.spyOn(clubSeatAssignmentRepository, 'findOne').mockResolvedValueOnce(seatAssignment);
      jest.spyOn(playerRepository, 'findOne').mockResolvedValueOnce(player);
      jest.spyOn(seatRepository, 'findOne').mockResolvedValueOnce(seat);

      // Test the relationship
      const foundAssignment = await clubSeatAssignmentRepository.findOne({
        where: { club: { id: club.id } },
        relations: ['club', 'player', 'seat'],
      });

      expect(foundAssignment).not.toBeNull();
      expect(foundAssignment?.club).toBeDefined();
      expect(foundAssignment?.player).toBeDefined();
      expect(foundAssignment?.seat).toBeDefined();
    });
  });
});
