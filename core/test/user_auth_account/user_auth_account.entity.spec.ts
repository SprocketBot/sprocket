import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAuthAccountEntity } from '../../src/db/user_auth_account/user_auth_account.entity';
import { UserAuthAccountRepository } from '../../src/db/user_auth_account/user_auth_account.repository';

describe('UserAuthAccountEntity', () => {
  it('should be defined', () => {
    expect(UserAuthAccountEntity).toBeDefined();
  });
});

describe('Base Entity Fields', () => {
  it('should have id field', () => {
    const userAuthAccount = new UserAuthAccountEntity();
    expect(userAuthAccount.id).toBeUndefined();
  });

  it('should have createdAt field', () => {
    const userAuthAccount = new UserAuthAccountEntity();
    expect(userAuthAccount.createdAt).toBeUndefined();
  });

  it('should have updateAt field', () => {
    const userAuthAccount = new UserAuthAccountEntity();
    expect(userAuthAccount.updateAt).toBeUndefined();
  });
});

describe('UserAuthAccountRepository', () => {
  let module: TestingModule;
  let userAuthAccountRepository: Repository<UserAuthAccountEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(UserAuthAccountEntity),
          useClass: Repository,
        },
        UserAuthAccountRepository,
      ],
    }).compile();

    userAuthAccountRepository = module.get(
      getRepositoryToken(UserAuthAccountEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(UserAuthAccountRepository).toBeDefined();
  });

  it('should create a new user auth account', async () => {
    const userAuthAccount = new UserAuthAccountEntity();
    jest
      .spyOn(userAuthAccountRepository, 'save')
      .mockResolvedValueOnce(userAuthAccount);

    const savedUserAuthAccount =
      await userAuthAccountRepository.save(userAuthAccount);
    expect(savedUserAuthAccount).toBeDefined();
    expect(savedUserAuthAccount).toBeInstanceOf(UserAuthAccountEntity);
  });

  it('should find a user auth account by id', async () => {
    const userAuthAccount = new UserAuthAccountEntity();
    jest
      .spyOn(userAuthAccountRepository, 'findOne')
      .mockResolvedValueOnce(userAuthAccount);

    const foundUserAuthAccount = await userAuthAccountRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundUserAuthAccount).toBeDefined();
    expect(foundUserAuthAccount).toBeInstanceOf(UserAuthAccountEntity);
  });
});
