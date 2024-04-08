import {
  Resolver,
  ResolveField,
  Root,
  Query,
  Args,
  Mutation,
} from '@nestjs/graphql';
import { FindUserInput, UserObject } from './user.object';
import { CurrentUser } from '../../auth/current-user/current-user.decorator';
import type { User } from '@sprocketbot/lib/types';
import { UseGuards } from '@nestjs/common';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { Logger } from '@nestjs/common';
import { UserRepository } from '../../db/user/user.repository';
import { PlayerObject } from '../player/player.object';
import { UserAuthAccountObject } from '../user_auth_account/user_auth_account.object';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { UserEntity } from '../../db/user/user.entity';

@Resolver(() => UserObject)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(private readonly userRepo: UserRepository) {}

  @Query(() => UserObject)
  @UseGuards(AuthorizeGuard())
  async whoami(
    @CurrentUser() user: User,
  ): Promise<Omit<UserObject, 'players' | 'accounts'>> {
    return user;
  }

  @Query(() => [UserObject])
  @UseGuards(AuthorizeGuard())
  async users(@Args('query') query: FindUserInput): Promise<UserObject[]> {
    const filter: FindOptionsWhere<UserEntity> = {};

    if ('active' in query) filter.active = query.active;
    if ('id' in query) {
      filter.id = query.id;
      const user = await this.userRepo.findOneBy({
        ...filter,
      });
      if (!user) throw new Error('User not found');
      return [
        {
          ...user,
          players: undefined,
          accounts: undefined,
        },
      ];
    }
    if (query.username) {
      if (query.username.fuzzy && query.username.term) {
        return this.userRepo
          .search(query.username.term, query.limit, 0, filter)
          .then((r) =>
            r.map((user) => ({
              ...user,
              players: undefined,
              accounts: undefined,
            })),
          );
      } else if (
        query.username.term ||
        (!query.username.term && !query.username.allowEmpty)
      ) {
        filter.username = query.username.term;
      }
    }

    if (query.limit > 50) throw new Error(`Limit must be <= 50`);
    const results = await this.userRepo.find({
      where: filter,
      take: query.limit,
    });
    return results.map((r) => ({
      ...r,
      players: undefined,
      accounts: undefined,
    }));
  }

  @Mutation(() => UserObject)
  @UseGuards(AuthorizeGuard()) // TODO: authz
  async alterUserActiveStatus(
    @Args('active') active: boolean,
    @Args('userId') userId: string,
  ) {
    const targetUser = await this.userRepo.findOneBy({ id: userId });
    if (!targetUser) throw new Error(`User not found`);
    targetUser.active = active;
    await this.userRepo.save(targetUser);
    return targetUser;
  }

  @ResolveField(() => [PlayerObject])
  async players(@Root() root: UserObject) {
    if (root.players) return root.players;

    const user = await this.userRepo.findOne({
      where: { id: root.id },
      relations: {
        players: true,
      },
    });
    return user.players;
  }

  @ResolveField(() => [UserAuthAccountObject])
  async accounts(
    @Root() root: UserObject,
  ): Promise<Omit<UserAuthAccountObject, 'user'>[]> {
    if (root.accounts) return root.accounts;
    const user = await this.userRepo.findOne({
      where: { id: root.id },
    });
    return (await user.accounts).map(
      (accountEntity): Omit<UserAuthAccountObject, 'user'> => ({
        userId: user.id,
        platform: accountEntity.platform,
        platformId: accountEntity.platformId,
        platformName: accountEntity.platformName,
      }),
    );
  }
}
