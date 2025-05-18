import { FranchiseEntity } from '../../src/db/franchise/franchise.entity';
import { FranchiseRepository } from '../../src/db/franchise/franchise.repository';

describe('FranchiseEntity', () => {
  it('should be defined', () => {
    expect(FranchiseEntity).toBeDefined();
  });
});

describe('FranchiseRepository', () => {
  it('should be defined', () => {
    expect(FranchiseRepository).toBeDefined();
  });
});
