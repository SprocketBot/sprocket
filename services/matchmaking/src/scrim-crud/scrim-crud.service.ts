import { Injectable, Logger } from '@nestjs/common';
import {
  GuidService,
  RedLock,
  RedisJsonService,
  RedisService,
} from '@sprocketbot/lib';
import {
  CreateScrimPayload,
  type Scrim,
  ScrimSchema,
} from '../connector/schemas';
import { parse, safeParse } from 'valibot';
import { ScrimState } from '../constants';
import { RpcException } from '@nestjs/microservices';

const ScrimRedisPrefix = 'scrim/';
const ScrimRedisKeyPattern = `${ScrimRedisPrefix}*`;
const ScrimRedisKey = (scrimId: string) => `${ScrimRedisPrefix}${scrimId}`;
@Injectable()
export class ScrimCrudService {
  private readonly logger = new Logger(ScrimCrudService.name);
  constructor(
    private readonly guidService: GuidService,
    private readonly redisService: RedisService,
    private readonly redisJsonService: RedisJsonService,
  ) {}

  private async flush(scrim: Omit<Scrim, 'participantCount'>): Promise<void> {
    await this.redisJsonService.SET(`${ScrimRedisPrefix}${scrim.id}`, '.', {
      ...scrim,
      participantCount: undefined,
      removedParticipants: undefined,
    });
  }

  async getAllScrims(): Promise<Scrim[]> {
    const scrimKeys = await this.redisService.keys(ScrimRedisKeyPattern);
    const output: Scrim[] = [];
    for (const key of scrimKeys) {
      const scrim = safeParse(
        ScrimSchema,
        await this.redisJsonService.GET(key),
      );
      if (!scrim.success) {
        this.logger.warn(`Found invalid scrim @ ${key}`, {
          issues: scrim.issues,
        });
        continue;
      }
      output.push(scrim.output);
    }
    return output;
  }

  async getScrim(scrimId: string): Promise<Scrim | null> {
    return this.redisJsonService.GET(scrimId, '.');
  }

  async getScrimByUserId(userId: string): Promise<Scrim | null> {
    const scrimKeys = await this.redisService.keys(ScrimRedisKeyPattern);

    for (const key of scrimKeys) {
      const r = await this.redisJsonService.GET(key);
      const scrim = safeParse(ScrimSchema, r);

      if (!scrim.success) {
        this.logger.warn(`Found invalid scrim @ ${key}`);
        continue;
      }
      if (scrim.output.participants.some((p) => p.id === userId)) {
        return scrim.output;
      }
    }
    return null;
  }
  @RedLock((scrim) => scrim.id)
  async updateScrimState(
    scrim: Scrim,
    state: ScrimState,
  ): Promise<Scrim | null> {
    scrim.state = state;
    await this.flush(scrim);
    return scrim;
  }

  @RedLock((scrim) => scrim.id)
  async removeUserFromScrim(
    scrim: Scrim,
    userId: string,
  ): Promise<Scrim | null> {
    scrim.participants = scrim.participants.filter((v) => v.id !== userId);
    await this.flush(scrim);

    return scrim;
  }

  @RedLock((scrim) => scrim.id)
  async addUserToScrim(scrim: Scrim, userId: string): Promise<Scrim | null> {
    scrim.participants.push({
      id: userId,
      checkedIn: false,
    });
    await this.flush(scrim);
    return scrim;
  }

  @RedLock((scrimId) => scrimId)
  async destroyScrim(scrimId: string): Promise<Scrim> {
    const scrim: Scrim = await this.redisJsonService.GET(
      ScrimRedisKey(scrimId),
    );
    parse(ScrimSchema, scrim); // we actually don't care about the result here

    await this.redisJsonService.DEL<Scrim>(ScrimRedisKey(scrimId));

    return scrim;
  }

  async createScrim(data: CreateScrimPayload): Promise<Scrim> {
    const scrim: Omit<Scrim, 'participantCount'> = {
      participants: [{ id: data.authorId }],

      id: this.guidService.getId(),
      gameId: data.gameId,
      skillGroupId: data.skillGroupId,
      authorId: data.authorId,
      gameModeId: data.gameModeId,
      state: ScrimState.PENDING,
      maxParticipants: data.maxParticipants,
      createdAt: new Date(),
    };

    await this.flush(scrim);
    return parse(ScrimSchema, scrim);
  }
}
