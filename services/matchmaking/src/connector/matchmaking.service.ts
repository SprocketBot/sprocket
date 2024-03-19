import { Inject, Injectable } from '@nestjs/common';
import { MatchmakingName } from './constants';
import { firstValueFrom } from 'rxjs';
import { MatchmakingEndpoint } from '../constants';
import { type MatchmakingProxy } from './types';
import { Scrim, User } from '@sprocketbot/lib/types';

@Injectable()
export class MatchmakingService {
  constructor(
    @Inject(MatchmakingName)
    private client: MatchmakingProxy,
  ) {}

  async test() {
    const result = await firstValueFrom(
      this.client.send(MatchmakingEndpoint.test, 'HI!'),
    );

    return result;
  }

  async createScrim(user: User): Promise<Scrim> {
    const result = await firstValueFrom(
      this.client.send(MatchmakingEndpoint.CreateScrim, {
        memberId: user.username,
      }),
    );

    return result;
  }
}
