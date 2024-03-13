import { Resolver, Query } from '@nestjs/graphql';
import { UserObject } from './user.object';
import { CurrentUser } from '../../auth/current-user/current-user.decorator';
import type { User } from '@sprocketbot/lib/types';
import { UseGuards } from '@nestjs/common';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { AuthorizeService } from '../../auth/authorize/authorize.service';
import { Logger } from '@nestjs/common';

@Resolver(() => UserObject)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(private readonly a: AuthorizeService) {}

  @Query(() => UserObject)
  @UseGuards(AuthorizeGuard())
  async whoami(@CurrentUser() user: User): Promise<UserObject> {
    await this.a.getAllRoles();

    return user;
  }
}
