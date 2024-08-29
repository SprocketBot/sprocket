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
import { FindOptionsWhere } from 'typeorm';
import { UserEntity } from '../../db/user/user.entity';
import { ResolverLibService } from '../resolver-lib/resolver-lib.service';
import { DataOnly } from '../types';

@Resolver(() => UserObject)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly resolverLib: ResolverLibService,
  ) {}

  @Query(() => UserObject)
  @UseGuards(AuthorizeGuard())
  async whoami(@CurrentUser() user: User): Promise<DataOnly<UserObject>> {
    const userEntity = await this.userRepo.findOneBy({ id: user.id });
    return userEntity.toObject();
  }

  @Query(() => [UserObject])
  @UseGuards(AuthorizeGuard())
  async users(
    @Args('query') query: FindUserInput,
  ): Promise<DataOnly<UserObject>[]> {
    const filter: FindOptionsWhere<UserEntity> = {};
    if ('active' in query) filter.active = query.active;

    if ('username' in query)
      return await this.resolverLib.find<UserEntity, UserObject>(
        this.userRepo,
        'username',
        query.username,
        filter,
      );
    if ('id' in query)
      return await this.resolverLib.find<UserEntity, UserObject>(
        this.userRepo,
        'id',
        { term: query.id, fuzzy: false, allowEmpty: false },
        filter,
      );
    throw new Error(
      `Unsupported query: ${JSON.stringify(query)}. Must specify id or username`,
    );
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
    if (root.players && root.players.length) return root.players;

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
  ): Promise<Omit<DataOnly<UserAuthAccountObject>, 'user'>[]> {
    if (root.accounts && root.accounts.length) return root.accounts;
    const user = await this.userRepo.findOne({
      where: { id: root.id },
    });
    
    return (await user.accounts).map(
      (accountEntity): Omit<DataOnly<UserAuthAccountObject>, 'user'> => {
        return accountEntity.toObject();
      },
    );
  }
}
