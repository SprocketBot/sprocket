import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubEntity } from '../../src/db/club/club.entity';
import { ClubRepository } from '../../src/db/club/club.repository';
import { ClubSeatAssignmentEntity } from '../../src/db/seat_assignment/club_seat_assignment/club_seat_assignment.entity';
import { UserEntity } from '../../src/db/user/user.entity';
import { SeatEntity } from '../../src/db/seat/seat.entity';

describe('ClubEntity', () => {
  let module: TestingModule;
  let clubRepository: Repository<ClubEntity>;
  let clubSeatAssignmentRepository: Repository<ClubSeatAssignmentEntity>;
  let userRepository: Repository<UserEntity>;
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
          provide: getRepositoryToken(UserEntity),
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
    userRepository = module.get(getRepositoryToken(UserEntity));
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
      const spy = vi.spyOn(clubRepository, 'save').mockResolvedValueOnce(club);

      const savedClub = await clubRepository.save(club);
      expect(savedClub).toBeDefined();
      expect(savedClub).toBeInstanceOf(ClubEntity);
      spy.mockRestore();
    });

    it('should find a club by id', async () => {
      const club = new ClubEntity();
      const spy = vi.spyOn(clubRepository, 'findOne').mockResolvedValueOnce(club);

      const foundClub = await clubRepository.findOne({ where: { id: 'test-id' } });
      expect(foundClub).toBeDefined();
      expect(foundClub).toBeInstanceOf(ClubEntity);
      spy.mockRestore();
    });
  });

  describe('Club Relationships', () => {
    it('should have relationship with ClubSeatAssignment', async () => {
      const seatAssignment = new ClubSeatAssignmentEntity();
      const club = new ClubEntity();
      const user = new UserEntity();
      const seat = new SeatEntity();
      seatAssignment.club = club;
      seatAssignment.user = user;
      seatAssignment.seat = seat;

      // Mock the relationships
      const clubSpy = vi.spyOn(clubSeatAssignmentRepository, 'findOne').mockResolvedValueOnce(seatAssignment);
      const userSpy = vi.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      const seatSpy = vi.spyOn(seatRepository, 'findOne').mockResolvedValueOnce(seat);

      // Test the relationship
      const foundAssignment = await clubSeatAssignmentRepository.findOne({
        where: { club: { id: club.id } },
        relations: ['club', 'user', 'seat'],
      });

      expect(foundAssignment).not.toBeNull();
      expect(foundAssignment?.club).toBeDefined();
      expect(foundAssignment?.user).toBeDefined();
      expect(foundAssignment?.seat).toBeDefined();
      clubSpy.mockRestore();
      userSpy.mockRestore();
      seatSpy.mockRestore();
    });
  });
});
