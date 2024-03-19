import { Mutation, Resolver, Subscription } from '@nestjs/graphql';
import type { Scrim, User } from '@sprocketbot/lib/types';
import { Observable, from } from 'rxjs';
import { ScrimObject } from './scrim.object';
import { MatchmakingService } from '@sprocketbot/matchmaking';
import { CurrentUser } from 'src/auth/current-user/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthorizeGuard } from 'src/auth/authorize/authorize.guard';

@Resolver()
export class ScrimResolver {
  constructor (
    private readonly matchmakingService: MatchmakingService
  ) {}
  
  @Subscription(() => ScrimObject)
  async watchScrims(): Promise<Observable<Scrim>> {
    return from([]);
  }

  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard())
  async createScrim(@CurrentUser() user: User): Promise<Scrim> {
    const result = await this.matchmakingService.createScrim(user)
    console.log(result)
    return {
      participants: [],
      scrimId: '5'
    }
  }
}
