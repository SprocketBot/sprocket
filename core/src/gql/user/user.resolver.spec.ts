import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserRepository } from '../../db/user/user.repository';
import { AUTHZ_ENFORCER } from 'nest-authz';
import { AuthZGuard } from 'nest-authz';
import { AuthenticateService } from '../../auth/authenticate/authenticate.service';
import { AuthorizeService } from '../../auth/authorize/authorize.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { User } from '@sprocketbot/lib/types';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let repo: UserRepository;
  let enforcer: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserRepository,
          useValue: {
            find: vi.fn(),
            findOneBy: vi.fn(),
            search: vi.fn(),
          },
        },
        {
          provide: AUTHZ_ENFORCER,
          useValue: {
            enforce: vi.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AuthenticateService,
          useValue: {},
        },
        {
          provide: AuthorizeService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(AuthZGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<UserResolver>(UserResolver);
    repo = module.get<UserRepository>(UserRepository);
    enforcer = module.get(AUTHZ_ENFORCER);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('users', () => {
    it('should return users when query has empty term and undefined allowEmpty', async () => {
      // Mock user
      const currentUser = { id: 'userid' } as User;

      // Mock repo response
      const mockUsers = [{ id: '1', username: 'user1' }];
      vi.spyOn(repo, 'find').mockResolvedValue(mockUsers as any);

      // Input that triggers the bug (undefined allowEmpty)
      const query = {
        username: {
          term: '',
          fuzzy: true,
          allowEmpty: undefined,
        },
        limit: 50,
      };

      const result = await resolver.users(query as any, currentUser);

      // Expect filter to NOT include username: ''
      // If allowEmpty logic is fixed, it calls repo.find with empty where (or without username)
      expect(repo.find).toHaveBeenCalledWith({
        where: {}, // Empty filter
        take: 50, // Default limit
      });

      expect(result[0].id).toBe('1');
    });

    it('should return users when query has empty term and allowEmpty is true', async () => {
      const currentUser = { id: 'userid' } as User;
      const mockUsers = [{ id: '1', username: 'user1' }];
      vi.spyOn(repo, 'find').mockResolvedValue(mockUsers as any);

      const query = {
        username: {
          term: '',
          fuzzy: true,
          allowEmpty: true,
        },
        limit: 50,
      };

      await resolver.users(query as any, currentUser);

      expect(repo.find).toHaveBeenCalledWith({
        where: {},
        take: 50,
      });
    });

    it('should return empty list (or filtered) when allowEmpty is FALSE', async () => {
      const currentUser = { id: 'userid' } as User;
      // If filter applies, and we find nothing
      vi.spyOn(repo, 'find').mockResolvedValue([]);

      const query = {
        username: {
          term: '',
          fuzzy: true,
          allowEmpty: false,
        },
        limit: 50,
      };

      await resolver.users(query as any, currentUser);

      expect(repo.find).toHaveBeenCalledWith({
        where: { username: '' },
        take: 50,
      });
    });
  });
});
