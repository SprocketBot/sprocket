interface MockRepository {
  createQueryBuilder: jest.Mock;
  hasId: jest.Mock;
  getId: jest.Mock;
  create: jest.Mock;
  merge: jest.Mock;
  preload: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  softRemove: jest.Mock;
  recover: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  softDelete: jest.Mock;
  restore: jest.Mock;
  count: jest.Mock;
  find: jest.Mock;
  findAndCount: jest.Mock;
  findByIds: jest.Mock;
  findOne: jest.Mock;
  findOneOrFail: jest.Mock;
  query: jest.Mock;
  clear: jest.Mock;
  increment: jest.Mock;
  decrement: jest.Mock;
}

const createMockRepository = (): MockRepository => ({
  createQueryBuilder: jest.fn(),
  hasId: jest.fn(),
  getId: jest.fn(),
  create: jest.fn(),
  merge: jest.fn(),
  preload: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findByIds: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  query: jest.fn(),
  clear: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
});

export default createMockRepository;
