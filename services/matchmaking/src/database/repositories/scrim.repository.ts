import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scrim } from '../entities/scrim.entity';
import { Participant } from '../entities/participant.entity';
import { Scrim as ScrimType } from '../../connector/schemas';

@Injectable()
export class ScrimRepository {
  constructor(
    @InjectRepository(Scrim)
    private readonly scrimRepository: Repository<Scrim>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async findAll(): Promise<ScrimType[]> {
    const scrims = await this.scrimRepository.find({
      relations: ['participants'],
    });
    return scrims.map(this.mapScrimToType);
  }

  async findById(id: string): Promise<ScrimType | null> {
    const scrim = await this.scrimRepository.findOne({
      where: { id },
      relations: ['participants'],
    });
    return scrim ? this.mapScrimToType(scrim) : null;
  }

  async findByUserId(userId: string): Promise<ScrimType | null> {
    const participant = await this.participantRepository.findOne({
      where: { userId },
      relations: ['scrim', 'scrim.participants'],
    });

    if (!participant) return null;
    return this.mapScrimToType(participant.scrim);
  }

  async create(
    scrimData: Omit<ScrimType, 'id' | 'createdAt' | 'participantCount'>,
  ): Promise<ScrimType> {
    const scrim = this.scrimRepository.create({
      ...scrimData,
      participants: scrimData.participants.map((p) => ({
        id: p.id,
        userId: p.id, // Assuming the participant id is the same as userId
        checkedIn: p.checkedIn,
      })),
    });

    const savedScrim = await this.scrimRepository.save(scrim);
    return this.mapScrimToType(savedScrim);
  }

  async update(scrim: ScrimType): Promise<ScrimType> {
    const updatedScrim = await this.scrimRepository.save({
      ...scrim,
      participants: scrim.participants.map((p) => ({
        id: p.id,
        userId: p.id,
        checkedIn: p.checkedIn,
        scrimId: scrim.id,
      })),
    });

    return this.mapScrimToType(updatedScrim);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.scrimRepository.delete(id);
    return result.affected > 0;
  }

  private mapScrimToType(scrim: Scrim): ScrimType {
    return {
      id: scrim.id,
      authorId: scrim.authorId,
      participants: scrim.participants.map((p) => ({
        id: p.userId,
        checkedIn: p.checkedIn,
      })),
      participantCount: scrim.participantCount,
      maxParticipants: scrim.maxParticipants,
      gameId: scrim.gameId,
      gameModeId: scrim.gameModeId,
      skillGroupId: scrim.skillGroupId,
      state: scrim.state,
      createdAt: scrim.createdAt,
      removedParticipants: [], // This will need to be handled if needed
      pendingTtl: scrim.pendingTtl,
    };
  }
}
