import { Injectable, Logger } from '@nestjs/common';
import { ScrimRepository } from '../database/repositories/scrim.repository';
import { Scrim, ScrimParticipant } from '../connector/schemas';
import { ScrimState } from '../constants';
import { RedLock } from '@sprocketbot/lib';

@Injectable()
export class ScrimCrudService {
  private readonly logger = new Logger(ScrimCrudService.name);

  constructor(private readonly scrimRepository: ScrimRepository) {}

  async getAllScrims(): Promise<Scrim[]> {
    return this.scrimRepository.findAll();
  }

  async getScrim(scrimId: string): Promise<Scrim | null> {
    return this.scrimRepository.findById(scrimId);
  }

  async getScrimByUserId(userId: string): Promise<Scrim | null> {
    return this.scrimRepository.findByUserId(userId);
  }

  @RedLock((scrim) => scrim.id)
  async updateScrimState(
    scrim: Scrim,
    state: ScrimState,
  ): Promise<Scrim | null> {
    const updatedScrim = await this.scrimRepository.update({
      ...scrim,
      state,
    });
    return updatedScrim;
  }

  @RedLock((scrim) => scrim.id)
  async updateScrim(scrim: Scrim): Promise<Scrim | null> {
    const updatedScrim = await this.scrimRepository.update(scrim);
    return updatedScrim;
  }

  async removeUserFromScrim(
    scrim: Scrim,
    userId: string,
  ): Promise<Scrim | null> {
    const updatedScrim = await this.scrimRepository.update({
      ...scrim,
      participants: scrim.participants.filter((p) => p.id !== userId),
    });

    return updatedScrim;
  }

  async createScrim(
    authorId: string,
    gameId: string,
    gameModeId: string,
    skillGroupId: string,
    maxParticipants: number,
  ): Promise<Scrim> {
    const newScrim = await this.scrimRepository.create({
      authorId,
      gameId,
      gameModeId,
      skillGroupId,
      maxParticipants,
      participants: [],
      state: ScrimState.PENDING,
    });

    return newScrim;
  }

  @RedLock((scrim) => scrim.id)
  async addUserToScrim(scrim: Scrim, userId: string): Promise<Scrim | null> {
    // Check if user is already in the scrim
    if (scrim.participants.some((p) => p.id === userId)) {
      return scrim;
    }

    const participant: ScrimParticipant = {
      id: userId,
      checkedIn: false,
    };

    const updatedScrim = await this.scrimRepository.update({
      ...scrim,
      participants: [...scrim.participants, participant],
    });

    return updatedScrim;
  }

  @RedLock((scrimId: string) => scrimId)
  async deleteScrimById(scrimId: string): Promise<Scrim | null> {
    const scrim = await this.scrimRepository.findById(scrimId);
    if (scrim) {
      await this.scrimRepository.delete(scrimId);
    }
    return scrim;
  }

  @RedLock((scrim: Scrim) => scrim.id)
  async deleteScrim(scrim: Scrim): Promise<boolean> {
    await this.scrimRepository.delete(scrim.id);
    return true;
  }
}
