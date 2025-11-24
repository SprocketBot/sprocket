import { Inject, Injectable } from '@nestjs/common';
import { MatchmakingName } from './constants';
import { firstValueFrom } from 'rxjs';
import { MatchmakingEndpoint } from '../constants';
import { MatchmakingEndpointMap, type MatchmakingProxy } from './types';
import { User } from '@sprocketbot/lib/types';
import {
  CreateScrimPayload,
  DestroyScrimPayload,
  ListScrimsPayload,
  Scrim,
} from './schemas';

@Injectable()
export class MatchmakingService {
  constructor(
    @Inject(MatchmakingName)
    private client: MatchmakingProxy,
  ) {}

  private async send<Endpoint extends MatchmakingEndpoint>(
    endpoint: Endpoint,
    payload: MatchmakingEndpointMap[Endpoint]['requestData'],
  ): Promise<MatchmakingEndpointMap[Endpoint]['responseData']> {
    try {
      const promise = firstValueFrom(this.client.send(endpoint, payload));
      await Promise.race([
        promise,
        new Promise<MatchmakingEndpointMap[Endpoint]['requestData']>((r, rej) =>
          setTimeout(
            () => rej(new Error(`Matchmaking Service Timed Out ${endpoint}`)),
            2000,
          ),
        ),
      ]);
      return await promise; // this promise is now timeout checked
    } catch (e) {
      if (!(e instanceof Error)) {
        throw new Error(e.message ?? 'Unknown Error');
      }
      throw e;
    }
  }

  async listScrims(payload: ListScrimsPayload): Promise<Scrim[]> {
    return await this.send(MatchmakingEndpoint.ListScrims, payload);
  }

  async createScrim(payload: CreateScrimPayload): Promise<Scrim> {
    return this.send(MatchmakingEndpoint.CreateScrim, payload);
  }
  async destroyScrim(payload: DestroyScrimPayload): Promise<Scrim> {
    return this.send(MatchmakingEndpoint.DestroyScrim, payload);
  }

  async joinScrim(user: User, scrimId: string): Promise<Scrim> {
    return this.send(MatchmakingEndpoint.JoinScrim, {
      participantId: user.id,
      scrimId,
    });
  }

  async getScrimForUser(user: User): Promise<Scrim | null> {
    const result = await this.send(MatchmakingEndpoint.GetScrimForUser, {
      userId: user.id,
    });
    return result || null;
  }

  async removeUserFromScrim(user: User): Promise<Scrim> {
    const result = await this.send(MatchmakingEndpoint.RemoveUserFromScrim, {
      userId: user.id,
    });
    return result;
  }

  async getScrimPendingTtl(scrimId: string): Promise<number> {
    return this.send(MatchmakingEndpoint.GetScrimPendingTTL, { scrimId });
  }
}
