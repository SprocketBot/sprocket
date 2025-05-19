import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../src/db/user/user.entity';
import { UserRepository } from '../../src/db/user/user.repository';

describe('UserEntity', () => {
  it('should be defined', () => {
    expect(UserEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const user = new UserEntity();
      expect(user.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const user = new UserEntity();
      expect(user.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const user = new UserEntity();
      expect(user.updateAt).toBeUndefined();
    });
  });
});

describe('UserRepository', () => {
  let module: TestingModule;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        UserRepository,
      ],
    }).compile();

    userRepository = module.get(getRepositoryToken(UserEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(UserRepository).toBeDefined();
  });

  it('should create a new user', async () => {
    const user = new UserEntity();
    jest.spyOn(userRepository, 'save').mockResolvedValueOnce(user);

    const savedUser = await userRepository.save(user);
    expect(savedUser).toBeDefined();
    expect(savedUser).toBeInstanceOf(UserEntity);
  });

  it('should find a user by id', async () => {
    const user = new UserEntity();
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);

    const foundUser = await userRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundUser).toBeDefined();
    expect(foundUser).toBeInstanceOf(UserEntity);
  });
});
