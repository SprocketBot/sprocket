import { Injectable, Logger } from '@nestjs/common';
import { SprocketEvent } from '@sprocketbot/lib';
import { User } from '@sprocketbot/lib/types';
import {
  ScrimState,
  type Scrim,
  type ListScrimsPayload,
  MatchmakingService,
  type CreateScrimPayload,
  DestroyScrimPayload,
} from '@sprocketbot/matchmaking';
import { Request } from 'express';
import { UserRepository } from '../../db/user/user.repository';
import { PlayerRepository } from '../../db/player/player.repository';
import { GameRepository } from '../../db/game/game.repository';
import { GameModeRepository } from '../../db/game_mode/game_mode.repository';

@Injectable()
export class ScrimService {
  protected static logger = new Logger(ScrimService.name);
  // We can't use DI for decorator functions, hence static
  static filterPendingScrims({ payload: scrim }: { payload: Scrim }) {
    return (
      scrim.participants.length === 0 || scrim.state === ScrimState.PENDING
    );
  }

  static resolveScrim(nullComplete: boolean = false) {
    return (payload: SprocketEvent<Scrim>) => {
      if (
        nullComplete &&
        [ScrimState.CANCELLED, ScrimState.COMPLETE].includes(
          payload.payload.state,
        )
      ) {
        return null;
      }

      return payload.payload;
    };
  }

  static filterCurrentScrim(
    rawPayload: { payload: Scrim },
    _: unknown,
    ctx: { req: Request },
  ): boolean {
    if (!('payload' in rawPayload)) {
      this.logger.warn(
        `Missing payload when filtering current scrim. An event was published incorrectly`,
        { rawPayload },
      );
      return false;
    }
    const { payload } = rawPayload;
    if (!ctx.req.user) {
      this.logger.warn(
        `User not found in request, AuthorizeGuard malfunction?`,
      );
      return false;
    }

    return (
      payload.participants.some((part) => part.id === ctx.req.user.id) ||
      payload.removedParticipants.includes(ctx.req.user.id)
    );
  }

  constructor(
    private readonly userRepo: UserRepository,
    private readonly playerRepo: PlayerRepository,
    private readonly gameRepo: GameRepository,
    private readonly gameModeRepo: GameModeRepository,
    private readonly matchmakingService: MatchmakingService,
  ) {}

  async getPendingScrims(
    query: ListScrimsPayload,
    user: User,
    asAdmin: boolean,
  ) {
    if (!asAdmin) {
      // make sure we don't accidentally use this
      delete query.gameId;
      delete query.skillGroupid;
      const dbUser = await this.userRepo.findOne({
        where: { id: user.id },
        relations: { players: true },
      });
      if (!dbUser) throw new Error('User not found');
      const allScrims: Scrim[] = [];
      for (const player of await dbUser.players) {
        if (query.gameId && player.gameId !== query.gameId) continue;
        if (query.skillGroupid && player.skillGroupId !== query.skillGroupid)
          continue;
        const playerScrims = await this.matchmakingService.listScrims({
          gameId: player.gameId,
          skillGroupid: player.skillGroupId,
          state: ScrimState.PENDING,
        });
        // Get the available scrims for the player
        allScrims.push(...playerScrims);
      }
      return allScrims;
    }
    // todo: authz
    // If user is an admin, respect the input query
    return await this.matchmakingService.listScrims(query ?? {});
  }

  async listScrims(payload: ListScrimsPayload) {
    // todo: authz
    return await this.matchmakingService.listScrims(payload);
  }

  async getScrimForUser(user: User) {
    return await this.matchmakingService.getScrimForUser(user);
  }

  async createScrim(user: User, payload: Partial<CreateScrimPayload>) {
    const player = await this.playerRepo.findOne({
      where: { userId: user.id, gameId: payload.gameId },
    });
    const game = await this.gameRepo.findOne({
      where: { id: payload.gameId },
    });
    if (!player) {
      if (!game) throw new Error('Game not found');
      else throw new Error(`User is not a player for ${game.name}`);
    }
    const modes = await game.gameModes;
    const mode = modes.find((mode) => mode.id === payload.gameModeId);
    if (!mode) {
      const gameMode = await this.gameModeRepo.findOneBy({
        id: payload.gameModeId,
      });
      if (!gameMode) throw new Error(`Game Mode not Found`);
      else throw new Error(`${gameMode.name} is not a mode for ${game.name}`);
    }

    const result = await this.matchmakingService.createScrim({
      authorId: user.id,
      gameId: game.id,
      skillGroupId: player.skillGroupId,
      gameModeId: mode.id,
      maxParticipants: mode.playerCount,
      options: payload.options,
    });

    return result;
  }

  async destroyScrim(user: User, payload: DestroyScrimPayload): Promise<Scrim> {
    // todo: authz

    return await this.matchmakingService.destroyScrim(payload);
  }
}
