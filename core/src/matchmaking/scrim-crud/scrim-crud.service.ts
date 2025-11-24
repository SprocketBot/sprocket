import { Injectable, Logger } from '@nestjs/common';
import { GuidService } from '@sprocketbot/lib';
import {
  CreateScrimPayload,
  type Scrim,
  ScrimSchema,
} from '../connector/schemas';
import { parse, safeParse } from 'valibot';
import { ScrimState } from '../constants';
import { RpcException } from '@nestjs/microservices';
import { ScrimRepository } from '../../db/scrim/scrim.repository';
import { PlayerRepository } from '../../db/player/player.repository';
import { GameRepository } from '../../db/game/game.repository';
import { GameModeRepository } from '../../db/game_mode/game_mode.repository';
import { SkillGroupRepository } from '../../db/skill_group/skill_group.repository';
import { ScrimEntity } from '../../db/scrim/scrim.entity';

@Injectable()
export class ScrimCrudService {
  private readonly logger = new Logger(ScrimCrudService.name);
  constructor(
    private readonly guidService: GuidService,
    private readonly scrimRepository: ScrimRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly gameRepository: GameRepository,
    private readonly gameModeRepository: GameModeRepository,
    private readonly skillGroupRepository: SkillGroupRepository,
  ) { }

  async getAllScrims(): Promise<Scrim[]> {
    const entities = await this.scrimRepository.find({
      relations: ['players', 'game', 'gameMode', 'skillGroup'],
    });
    return entities.map(entity => this.mapEntityToScrim(entity));
  }

  async getScrim(scrimId: string): Promise<Scrim | null> {
    const entity = await this.scrimRepository.findOne({
      where: { id: scrimId },
      relations: ['players', 'game', 'gameMode', 'skillGroup'],
    });
    if (!entity) return null;
    return this.mapEntityToScrim(entity);
  }

  private mapEntityToScrim(entity: ScrimEntity): Scrim {
    return {
      id: entity.id,
      state: entity.state,
      gameId: entity.game.id,
      gameModeId: entity.gameMode.id,
      skillGroupId: entity.skillGroup.id,
      authorId: entity.authorId,
      participants: entity.players.map(player => ({ id: player.id, checkedIn: false })),
      participantCount: entity.players.length,
      maxParticipants: entity.maxPlayers,
      createdAt: entity.createdAt,
      removedParticipants: [],
      pendingTtl: entity.pendingExpiresAt ? Math.max(0, Math.floor((entity.pendingExpiresAt.getTime() - Date.now()) / 1000)) : 0,
    };
  }

  async getScrimByUserId(userId: string): Promise<Scrim | null> {
    const entity = await this.scrimRepository.createQueryBuilder('scrim')
      .innerJoinAndSelect('scrim.players', 'player')
      .leftJoinAndSelect('scrim.game', 'game')
      .leftJoinAndSelect('scrim.gameMode', 'gameMode')
      .leftJoinAndSelect('scrim.skillGroup', 'skillGroup')
      .where('player.id = :userId', { userId })
      .getOne();

    if (!entity) return null;

    return this.mapEntityToScrim(entity);
  }

  async updateScrimState(
    scrimId: string,
    state: ScrimState,
  ): Promise<Scrim | null> {
    const entity = await this.scrimRepository.findOne({ where: { id: scrimId } });
    if (!entity) return null;
    entity.state = state;
    await this.scrimRepository.save(entity);
    return this.getScrim(scrimId);
  }

  async removeUserFromScrim(
    scrimId: string,
    userId: string,
  ): Promise<Scrim | null> {
    const entity = await this.scrimRepository.findOne({
      where: { id: scrimId },
      relations: ['players'],
    });
    if (!entity) return null;
    entity.players = entity.players.filter(p => p.id !== userId);
    await this.scrimRepository.save(entity);
    return this.getScrim(scrimId);
  }

  async addUserToScrim(scrimId: string, userId: string): Promise<Scrim | null> {
    const entity = await this.scrimRepository.findOne({
      where: { id: scrimId },
      relations: ['players'],
    });
    if (!entity) return null;
    const player = await this.playerRepository.findOne({ where: { id: userId } });
    if (!player) throw new RpcException(`Player not found`);
    entity.players.push(player);
    await this.scrimRepository.save(entity);
    return this.getScrim(scrimId);
  }

  async destroyScrim(scrimId: string): Promise<Scrim> {
    const scrim = await this.getScrim(scrimId);
    if (!scrim) throw new RpcException(`Scrim not found`);
    await this.scrimRepository.delete({ id: scrimId });
    return scrim;
  }

  async createScrim(data: CreateScrimPayload): Promise<Scrim> {
    const game = await this.gameRepository.findOne({ where: { id: data.gameId } });
    const gameMode = await this.gameModeRepository.findOne({ where: { id: data.gameModeId } });
    const skillGroup = await this.skillGroupRepository.findOne({ where: { id: data.skillGroupId } });
    const author = await this.playerRepository.findOne({ where: { id: data.authorId } });

    if (!game || !gameMode || !skillGroup || !author) throw new RpcException(`Invalid data`);

    const entity = this.scrimRepository.create({
      id: this.guidService.getId(),
      state: ScrimState.PENDING,
      authorId: data.authorId,
      game,
      gameMode,
      skillGroup,
      players: [author],
      maxPlayers: data.maxParticipants,
      createdAt: new Date(),
      settings: {}, // Add settings if needed
    });

    await this.scrimRepository.save(entity);
    return this.getScrim(entity.id);
  }
}
