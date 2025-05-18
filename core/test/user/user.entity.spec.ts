import { UserEntity } from '../../src/db/user/user.entity';
import { UserRepository } from '../../src/db/user/user.repository';

describe('UserEntity', () => {
  it('should be defined', () => {
    expect(UserEntity).toBeDefined();
  });
});

describe('UserRepository', () => {
  it('should be defined', () => {
    expect(UserRepository).toBeDefined();
  });
});
