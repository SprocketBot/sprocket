import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlayerStatEntity } from './player_stat.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PlayerStatRepository extends Repository<PlayerStatEntity> {
  constructor(
    @InjectRepository(PlayerStatEntity)
    baseRepository: Repository<PlayerStatEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }
}
