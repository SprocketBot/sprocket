import { Injectable, Logger } from '@nestjs/common';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';
import type {
  AddUserToScrimPayload,
  CreateScrimPayload,
  GetScrimPendingTTLPayload,
  ListScrimsPayload,
  RemoveUserFromScrimPayload,
  Scrim,
} from '../connector/schemas';
import { RpcException } from '@nestjs/microservices';
import { MatchmakingEvents, ScrimState } from '../constants';
import {
  EventsService,
  RedLock,
  RedisService,
  redlock,
} from '@sprocketbot/lib';
import { ScrimPendingTimeoutService } from '../jobs/scrim-pending-timeout/scrim-pending-timeout.service';

@Injectable()
export class ScrimService {
  private readonly logger = new Logger(ScrimService.name);
  constructor(
    private readonly scrimCrudService: ScrimCrudService,
    private readonly eventService: EventsService,
    private readonly redisService: RedisService,
    private readonly scrimPendingTimeoutService: ScrimPendingTimeoutService,
  ) {}
  async createScrim(data: CreateScrimPayload): Promise<Scrim> {
    if (await this.scrimCrudService.getScrimByUserId(data.authorId)) {
      throw new RpcException(
        `User cannot create scrim, they are already in a scrim!`,
      );
    }

    // Scrim is created
    const output = await this.scrimCrudService.createScrim(data);
    output.pendingTtl = data.options.pendingTimeout;
    await this.scrimPendingTimeoutService.enqueue(output.id, output.pendingTtl);
    await this.eventService.publish(MatchmakingEvents.ScrimUpdated, output);

    return output;
  }

  async listScrims(filter?: ListScrimsPayload): Promise<Scrim[]> {
    const allScrims = await this.scrimCrudService.getAllScrims();
    let output = allScrims;
    if (filter) {
      if (filter.state) {
        output = output.filter((out) => out.state === filter.state);
      }
      if (filter.gameId) {
        output = output.filter((out) => out.gameId === filter.gameId);
      }
      if (filter.skillGroupid) {
        output = output.filter(
          (out) => out.skillGroupId === filter.skillGroupid,
        );
      }
    }
    return output;
  }

  async getScrim(scrimId: string): Promise<Scrim | null> {
    return await this.scrimCrudService.getScrim(scrimId);
  }

  async getAllScrims(): Promise<Scrim[]> {
    return await this.scrimCrudService.getAllScrims();
  }

  async getScrimByUserId(userId: string): Promise<Scrim | null> {
    return await this.scrimCrudService.getScrimByUserId(userId);
  }

  async addUserToScrim(data: AddUserToScrimPayload): Promise<Scrim | null> {
    const scrim = await this.getScrimByUserId(data.userId);
    if (scrim.state !== ScrimState.PENDING)
      throw new RpcException(
        `Cannot add user to this scrim, scrim is not accepting players`,
      );
    return await redlock(this.redisService, [scrim.id], async () => {
      let updatedScrim = await this.scrimCrudService.addUserToScrim(
        scrim,
        data.userId,
      );
      if (updatedScrim.participants.length === updatedScrim.maxParticipants) {
        updatedScrim = await this.scrimCrudService.updateScrimState(
          updatedScrim,
          ScrimState.PENDING,
        );
      }
      await this.eventService.publish(
        MatchmakingEvents.ScrimUpdated,
        updatedScrim,
      );
      return updatedScrim;
    });
  }

  async removeUserFromScrim(
    payload: RemoveUserFromScrimPayload,
  ): Promise<Scrim> {
    const scrim = await this.scrimCrudService.getScrimByUserId(payload.userId);
    if (!scrim) throw new RpcException(`User is not in a scrim`);
    return await redlock(this.redisService, [scrim.id], async () => {
      // Check that the scrim didn't pop while waiting for a lock
      if (scrim.state !== ScrimState.PENDING) {
        throw new RpcException(
          'Cannot remove user from scrim, scrim is not PENDING!',
        );
      }
      const result = await this.scrimCrudService.removeUserFromScrim(
        scrim,
        payload.userId,
      );

      let output: Scrim;
      if (result.participants.length === 0) {
        output = await this.destroyScrim(scrim.id, true);
        output.removedParticipants = [payload.userId];
      } else {
        scrim.removedParticipants = [payload.userId];
        return scrim;
      }

      if (result)
        await this.eventService.publish(MatchmakingEvents.ScrimUpdated, output);
      return result;
    });
  }

  async getPendingTTL(payload: GetScrimPendingTTLPayload): Promise<number> {
    try {
      const ttl = await this.scrimPendingTimeoutService.getTtl(payload.scrimId);
      // TODO: Handle scrim that is not pending
      return ttl;
    } catch (e) {
      this.logger.error(e);
      throw new RpcException(e.message ?? 'Unknown Error');
    }
  }

  @RedLock((scrimId) => {
    console.log({ scrimId });
    return scrimId;
  })
  async destroyScrim(
    scrimId: string,
    cancelled: boolean = false,
  ): Promise<Scrim> {
    const scrim = await this.scrimCrudService.destroyScrim(scrimId);
    // Update before sending out
    scrim.state = cancelled ? ScrimState.CANCELLED : ScrimState.COMPLETE;
    scrim.removedParticipants = scrim.participants.map((p) => p.id);
    scrim.participants = [];
    console.log({
      scrim,
    });

    await this.eventService.publish(MatchmakingEvents.ScrimUpdated, scrim);
    return scrim;
  }
}
