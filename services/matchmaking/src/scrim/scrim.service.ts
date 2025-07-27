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
import { EventsService } from '@sprocketbot/lib';
import { ScrimPendingTimeoutService } from '../jobs/scrim-pending-timeout/scrim-pending-timeout.service';

function mapScrimEntityToApi(scrimEntity: any, pendingTtl?: number, removedParticipants?: string[]): any {
  if (!scrimEntity) return null;
  return {
    id: scrimEntity.id,
    authorId: scrimEntity.authorId,
    gameId: scrimEntity.gameId,
    skillGroupId: scrimEntity.skillGroupId,
    gameModeId: scrimEntity.gameModeId,
    state: scrimEntity.state,
    maxParticipants: scrimEntity.maxParticipants,
    createdAt: scrimEntity.createdAt,
    participants: scrimEntity.players?.map((p: any) => ({ id: p.userId, checkedIn: false })) ?? [],
    participantCount: scrimEntity.players?.length ?? 0,
    removedParticipants: removedParticipants ?? [],
    pendingTtl,
  };
}

@Injectable()
export class ScrimService {
  private readonly logger = new Logger(ScrimService.name);
  constructor(
    private readonly scrimCrudService: ScrimCrudService,
    private readonly eventService: EventsService,
    private readonly scrimPendingTimeoutService: ScrimPendingTimeoutService,
  ) {}
  async createScrim(data: CreateScrimPayload): Promise<any> {
    if (await this.scrimCrudService.getScrimByUserId(data.authorId)) {
      throw new RpcException(
        `User cannot create scrim, they are already in a scrim!`,
      );
    }

    // Scrim is created
    const scrimEntity = await this.scrimCrudService.createScrim(data);
    const pendingTtl = data.options?.pendingTimeout;
    await this.scrimPendingTimeoutService.enqueue(scrimEntity.id, pendingTtl);
    const apiScrim = mapScrimEntityToApi(scrimEntity, pendingTtl);
    await this.eventService.publish(MatchmakingEvents.ScrimUpdated, apiScrim);

    return apiScrim;
  }

  async listScrims(filter?: ListScrimsPayload): Promise<any[]> {
    const allScrims = (await this.scrimCrudService.getAllScrims()).map(entity => mapScrimEntityToApi(entity));
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

  async getScrim(scrimId: string): Promise<any | null> {
    const scrimEntity = await this.scrimCrudService.getScrim(scrimId);
    return mapScrimEntityToApi(scrimEntity);
  }

  async getAllScrims(): Promise<any[]> {
    return (await this.scrimCrudService.getAllScrims()).map(entity => mapScrimEntityToApi(entity));
  }

  async getScrimByUserId(userId: string): Promise<any | null> {
    const scrimEntity = await this.scrimCrudService.getScrimByUserId(userId);
    return mapScrimEntityToApi(scrimEntity);
  }

  async addUserToScrim(data: AddUserToScrimPayload): Promise<any | null> {
    const scrim = await this.getScrimByUserId(data.userId);
    if (scrim.state !== ScrimState.PENDING)
      throw new RpcException(
        `Cannot add user to this scrim, scrim is not accepting players`,
      );
    let updatedScrimEntity = await this.scrimCrudService.addUserToScrim(
      scrim.id,
      data.userId,
    );
    let updatedScrim = mapScrimEntityToApi(updatedScrimEntity);
    if (updatedScrim.participantCount === updatedScrim.maxParticipants) {
      updatedScrimEntity = await this.scrimCrudService.updateScrimState(
        updatedScrim.id,
        ScrimState.PENDING,
      );
      updatedScrim = mapScrimEntityToApi(updatedScrimEntity);
    }
    await this.eventService.publish(
      MatchmakingEvents.ScrimUpdated,
      updatedScrim,
    );
    return updatedScrim;
  }

  async removeUserFromScrim(
    payload: RemoveUserFromScrimPayload,
  ): Promise<any> {
    const scrim = await this.getScrimByUserId(payload.userId);
    if (!scrim) throw new RpcException(`User is not in a scrim`);
    // Check that the scrim didn't pop while waiting for a lock
    if (scrim.state !== ScrimState.PENDING) {
      throw new RpcException(
        'Cannot remove user from scrim, scrim is not PENDING!',
      );
    }
    const resultEntity = await this.scrimCrudService.removeUserFromScrim(
      scrim.id,
      payload.userId,
    );
    let result = mapScrimEntityToApi(resultEntity);
    let output: any;
    if (result.participantCount === 0) {
      output = await this.destroyScrim(scrim.id, true, [payload.userId]);
    } else {
      result.removedParticipants = [payload.userId];
      return result;
    }
    if (result)
      await this.eventService.publish(MatchmakingEvents.ScrimUpdated, output);
    return result;
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

  async destroyScrim(
    scrimId: string,
    cancelled: boolean = false,
    removedParticipants: string[] = [],
  ): Promise<any> {
    const scrimEntity = await this.scrimCrudService.destroyScrim(scrimId);
    let apiScrim = mapScrimEntityToApi(scrimEntity, undefined, removedParticipants);
    apiScrim.state = cancelled ? ScrimState.CANCELLED : ScrimState.COMPLETE;
    apiScrim.removedParticipants = removedParticipants;
    apiScrim.participants = [];
    await this.eventService.publish(MatchmakingEvents.ScrimUpdated, apiScrim);
    return apiScrim;
  }
}
