import { UserAuthAccountEntity } from '../../src/db/user_auth_account/user_auth_account.entity';
import { UserAuthAccountRepository } from '../../src/db/user_auth_account/user_auth_account.repository';

describe('UserAuthAccountEntity', () => {
  it('should be defined', () => {
    expect(UserAuthAccountEntity).toBeDefined();
  });
});

describe('UserAuthAccountRepository', () => {
  it('should be defined', () => {
    expect(UserAuthAccountRepository).toBeDefined();
  });
});
