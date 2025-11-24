import { Injectable, Logger } from '@nestjs/common';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';
import type {
  AddUserToScrimPayload,
  CreateScrimPayload,
  GetScrimPendingTTLPayload,
  ListScrimsPayload,
  RemoveUserFromScrimPayload,
  Scrim,
  DestroyScrimPayload,
} from '../connector/schemas';
import { RpcException } from '@nestjs/microservices';
import { MatchmakingEvents, ScrimState } from '../constants';
import { EventsService } from '@sprocketbot/lib';
import { TimeoutService } from '../timeout/timeout.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class ScrimService {
  private readonly logger = new Logger(ScrimService.name);
  constructor(
    private readonly scrimCrudService: ScrimCrudService,
    private readonly eventService: EventsService,
    private readonly timeoutService: TimeoutService,
    private readonly queueService: QueueService,
  ) { }

  async createScrim(data: CreateScrimPayload): Promise<Scrim> {
    if (await this.scrimCrudService.getScrimByUserId(data.authorId)) {
      throw new RpcException(
        `User cannot create scrim, they are already in a scrim!`,
      );
    }

    const output = await this.scrimCrudService.createScrim(data);
    await this.timeoutService.setPendingTimeout(output.id, data.options.pendingTimeout);
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
    const scrim = await this.getScrim(data.scrimId);
    if (!scrim) throw new RpcException(`Scrim not found`);
    if (scrim.state !== ScrimState.PENDING)
      throw new RpcException(
        `Cannot add user to this scrim, scrim is not accepting players`,
      );

    let updatedScrim = await this.scrimCrudService.addUserToScrim(
      scrim.id,
      data.userId,
    );
    if (updatedScrim.participantCount === updatedScrim.maxParticipants) {
      updatedScrim = await this.scrimCrudService.updateScrimState(
        updatedScrim.id,
        ScrimState.POPPED,
      );
      // Set popped timeout
      await this.timeoutService.setPoppedTimeout(updatedScrim.id, 5 * 60 * 1000); // 5 minutes
    }
    await this.eventService.publish(
      MatchmakingEvents.ScrimUpdated,
      updatedScrim,
    );
    return updatedScrim;
  }

  async removeUserFromScrim(
    payload: RemoveUserFromScrimPayload,
  ): Promise<Scrim> {
    const scrim = await this.scrimCrudService.getScrimByUserId(payload.userId);
    if (!scrim) throw new RpcException(`User is not in a scrim`);

    // Check that the scrim didn't pop
    if (scrim.state !== ScrimState.PENDING) {
      throw new RpcException(
        'Cannot remove user from scrim, scrim is not PENDING!',
      );
    }
    const result = await this.scrimCrudService.removeUserFromScrim(
      scrim.id,
      payload.userId,
    );

    let output: Scrim;
    if (result.participantCount === 0) {
      output = await this.destroyScrim(scrim.id, true);
      output.removedParticipants = [payload.userId];
    } else {
      output = result;
      output.removedParticipants = [payload.userId];
    }

    await this.eventService.publish(MatchmakingEvents.ScrimUpdated, output);
    return output;
  }

  async getPendingTTL(payload: GetScrimPendingTTLPayload): Promise<number> {
    return this.timeoutService.getPendingTTL(payload.scrimId);
  }

  async destroyScrim(
    scrimId: string,
    cancelled: boolean = false,
  ): Promise<Scrim> {
    const scrim = await this.scrimCrudService.destroyScrim(scrimId);
    // Update before sending out
    scrim.state = cancelled ? ScrimState.CANCELLED : ScrimState.COMPLETE;
    scrim.removedParticipants = scrim.participants.map((p) => p.id);
    scrim.participants = [];

    await this.eventService.publish(MatchmakingEvents.ScrimUpdated, scrim);
    return scrim;
  }

  // Additional methods to match the expected interface
  async joinScrim(userId: string, scrimId: string): Promise<Scrim> {
    return this.addUserToScrim({ scrimId, userId });
  }

  async leaveScrim(userId: string): Promise<Scrim> {
    return this.removeUserFromScrim({ userId });
  }

  async getScrimForUser(userId: string): Promise<Scrim | null> {
    return this.getScrimByUserId(userId);
  }

  async cancelScrim(payload: DestroyScrimPayload): Promise<Scrim> {
    return this.destroyScrim(payload.scrimId, payload.cancel);
  }

  async getScrimPendingTtl(scrimId: string): Promise<number> {
    return this.getPendingTTL({ scrimId });
  }

  // Queue management methods
  async joinQueue(playerId: string, gameId: string, skillRating: number): Promise<any> {
    return this.queueService.joinQueue({
      playerId,
      gameId,
      skillRating,
    });
  }

  async leaveQueue(playerId: string): Promise<boolean> {
    return this.queueService.leaveQueue({
      playerId,
    });
  }

  async getQueueStatus(playerId: string): Promise<any> {
    return this.queueService.getQueueStatus({
      playerId,
    });
  }

  async getQueuePosition(playerId: string): Promise<number> {
    return this.queueService.getQueuePosition(playerId);
  }

  async processMatchmaking(): Promise<any[]> {
    return this.queueService.processMatchmaking();
  }

  async getQueueStats(gameId?: string): Promise<any> {
    return this.queueService.getQueueStats(gameId);
  }
}
