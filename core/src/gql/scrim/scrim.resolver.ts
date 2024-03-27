import {
  Args,
  Int,
  Mutation,
  ResolveField,
  Resolver,
  Root,
  Subscription,
} from '@nestjs/graphql';
import type { Scrim, User } from '@sprocketbot/lib/types';
import { ScrimObject } from './scrim.object';
import { MatchmakingService } from '@sprocketbot/matchmaking';
import { CurrentUser } from 'src/auth/current-user/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthorizeGuard } from 'src/auth/authorize/authorize.guard';
import { CreateScrimInput } from './objects/inputs';

@Resolver(() => ScrimObject)
export class ScrimResolver {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Subscription(() => [ScrimObject])
  @UseGuards(AuthorizeGuard())
  async availableScrims(
    @CurrentUser() user: User,
  ): Promise<AsyncIterable<{ availableScrims: Scrim[] }>> {
    return (async function* (): AsyncGenerator<{ availableScrims: Scrim[] }> {
      yield {
        availableScrims: [{ scrimId: 'SomeOtherScrim?', participants: [] }],
      };
    })();
  }

  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard())
  async createScrim(
    @CurrentUser() user: User,
    @Args('payload', { type: () => CreateScrimInput })
    payload: CreateScrimInput,
  ): Promise<Scrim> {
    const result = await this.matchmakingService.createScrim({
      authorId: user.id,
      gameId: payload.gameId,
      skillGroupId: '', // TODO: Lookup skill group for player by game
    });
    console.log(result);
    return {
      participants: [],
      scrimId: '5',
    };
  }

  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard())
  async joinScrim(
    @CurrentUser() user: User,
    @Args('scrimId', { type: () => String }) scrimId: string,
  ): Promise<Scrim> {
    return await this.matchmakingService.joinScrim(user, scrimId);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthorizeGuard())
  async leaveScrim(@CurrentUser() user: User): Promise<boolean> {
    return await this.matchmakingService.leaveScrim(user);
  }

  @ResolveField(() => Int)
  participantCount(@Root() root: ScrimObject): number {
    return root.participants.length;
  }
}
