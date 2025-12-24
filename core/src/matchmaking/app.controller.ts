import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MatchmakingEndpoint } from './constants';
import {
  type Scrim,
  type CreateScrimPayload,
  type GetScrimForUserPayload,
  type RemoveUserFromScrimPayload,
  type GetScrimPendingTTLPayload,
  CreateScrimPayloadSchema,
  type AddUserToScrimPayload,
  type ListScrimsPayload,
  type DestroyScrimPayload,
} from './connector/schemas';
import { ScrimService } from './scrim/scrim.service';
import { parse } from 'valibot';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly scrimService: ScrimService) {}

  @MessagePattern(MatchmakingEndpoint.CreateScrim)
  async createScrim(payload: CreateScrimPayload): Promise<Scrim> {
    const scrim = await this.scrimService.createScrim(
      parse(CreateScrimPayloadSchema, payload),
    );

    return scrim;
  }

  @MessagePattern(MatchmakingEndpoint.DestroyScrim)
  async destroyScrim(payload: DestroyScrimPayload): Promise<Scrim> {
    console.log({ payload });
    const scrim = await this.scrimService.destroyScrim(payload.scrimId, true);

    return scrim;
  }

  @MessagePattern(MatchmakingEndpoint.ListScrims)
  async listScrims(payload: ListScrimsPayload): Promise<Scrim[]> {
    return await this.scrimService.listScrims(payload);
  }

  @MessagePattern(MatchmakingEndpoint.GetScrimForUser)
  async getScrimForUser(
    payload: GetScrimForUserPayload,
  ): Promise<Scrim | false> {
    return (await this.scrimService.getScrimByUserId(payload.userId)) ?? false;
  }

  @MessagePattern(MatchmakingEndpoint.RemoveUserFromScrim)
  async removeUserFromScrim(
    payload: RemoveUserFromScrimPayload,
  ): Promise<Scrim> {
    return await this.scrimService.removeUserFromScrim(payload);
  }

  @MessagePattern(MatchmakingEndpoint.GetScrimPendingTTL)
  async getScrimPendingTtl(
    payload: GetScrimPendingTTLPayload,
  ): Promise<number> {
    return await this.scrimService.getPendingTTL(payload);
  }

  @MessagePattern(MatchmakingEndpoint.AddUserToScrim)
  async addUserToScrim(payload: AddUserToScrimPayload): Promise<Scrim | null> {
    return await this.scrimService.addUserToScrim(payload);
  }
}
