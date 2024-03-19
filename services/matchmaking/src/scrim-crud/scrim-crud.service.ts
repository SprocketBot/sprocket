import { Injectable } from '@nestjs/common';
import { RedisJsonService, RedisService } from '@sprocketbot/lib';
import { Scrim } from '@sprocketbot/lib/types';

@Injectable()
export class ScrimCrudService {
  constructor(
    private readonly redisService: RedisService,
    private readonly redisJsonService: RedisJsonService,
  ) {}

  async getScrimByMemberId(memberId: string): Promise<Scrim | null> {
    throw new Error('Not yet implemented');
  }

  async createScrim(memberId: string): Promise<Scrim> {
    throw new Error('Not yet implemented');
  }
}
