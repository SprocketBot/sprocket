import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuidService } from '@sprocketbot/lib';
import { Scrim } from '../entities/scrim.entity';
import { ScrimPlayer } from '../entities/scrim-player.entity';
import { ScrimTimeout } from '../entities/scrim-timeout.entity';
import { CreateScrimPayload } from '../connector/schemas';
import { ScrimState } from '../constants';

@Injectable()
export class ScrimCrudService {
  private readonly logger = new Logger(ScrimCrudService.name);
  constructor(
    private readonly guidService: GuidService,
    @InjectRepository(Scrim)
    private readonly scrimRepo: Repository<Scrim>,
    @InjectRepository(ScrimPlayer)
    private readonly scrimPlayerRepo: Repository<ScrimPlayer>,
    @InjectRepository(ScrimTimeout)
    private readonly scrimTimeoutRepo: Repository<ScrimTimeout>,
  ) {}

  async getAllScrims(): Promise<Scrim[]> {
    return this.scrimRepo.find({ relations: ['players'] });
  }

  async getScrim(scrimId: string): Promise<Scrim | null> {
    return this.scrimRepo.findOne({
      where: { id: scrimId },
      relations: ['players'],
    });
  }

  async getScrimByUserId(userId: string): Promise<Scrim | null> {
    const player = await this.scrimPlayerRepo.findOne({
      where: { userId },
      relations: ['scrim'],
    });
    return player?.scrim || null;
  }

  async updateScrimState(
    scrimId: string,
    state: ScrimState,
  ): Promise<Scrim | null> {
    const scrim = await this.scrimRepo.findOne({ where: { id: scrimId } });
    if (!scrim) return null;
    scrim.state = state;
    await this.scrimRepo.save(scrim);
    return scrim;
  }

  async removeUserFromScrim(
    scrimId: string,
    userId: string,
  ): Promise<Scrim | null> {
    const player = await this.scrimPlayerRepo.findOne({
      where: { userId, scrim: { id: scrimId } },
    });
    if (player) await this.scrimPlayerRepo.remove(player);
    return this.getScrim(scrimId);
  }

  async addUserToScrim(scrimId: string, userId: string): Promise<Scrim | null> {
    const scrim = await this.scrimRepo.findOne({
      where: { id: scrimId },
      relations: ['players'],
    });
    if (!scrim) return null;
    const player = this.scrimPlayerRepo.create({ userId, scrim });
    await this.scrimPlayerRepo.save(player);
    return this.getScrim(scrimId);
  }

  async destroyScrim(scrimId: string): Promise<Scrim | null> {
    const scrim = await this.scrimRepo.findOne({
      where: { id: scrimId },
      relations: ['players'],
    });
    if (!scrim) return null;
    await this.scrimRepo.remove(scrim);
    return scrim;
  }

  async createScrim(data: CreateScrimPayload): Promise<Scrim> {
    const scrim = this.scrimRepo.create({
      id: this.guidService.getId(),
      gameId: data.gameId,
      skillGroupId: data.skillGroupId,
      authorId: data.authorId,
      gameModeId: data.gameModeId,
      state: ScrimState.PENDING,
      maxParticipants: data.maxParticipants,
      createdAt: new Date(),
      players: [],
    });
    await this.scrimRepo.save(scrim);
    const player = this.scrimPlayerRepo.create({
      userId: data.authorId,
      scrim,
    });
    await this.scrimPlayerRepo.save(player);
    return this.getScrim(scrim.id);
  }
}
