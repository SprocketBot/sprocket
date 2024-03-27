import { Inject, Injectable } from '@nestjs/common';
import { MatchmakingName } from './constants';
import { firstValueFrom } from 'rxjs';
import { MatchmakingEndpoint } from '../constants';
import { type MatchmakingProxy } from './types';
import { Scrim, User } from '@sprocketbot/lib/types';
import { CreateScrimPayload } from './schemas';

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

  async createScrim(payload: CreateScrimPayload): Promise<Scrim> {
    const result = await firstValueFrom(
      this.client.send(MatchmakingEndpoint.CreateScrim, payload),
    );

    return result;
  }

  async joinScrim(user: User, scrimId: string): Promise<Scrim> {
    throw new Error();
  }

  async leaveScrim(user: User): Promise<boolean> {
    throw new Error();
  }
}
