import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlayerEntity } from './player.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PlayerRepository extends Repository<PlayerEntity> {
  constructor(
    @InjectRepository(PlayerEntity)
    baseRepository: Repository<PlayerEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }
}
