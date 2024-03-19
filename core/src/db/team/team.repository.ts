import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamEntity } from './team.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeamRepository extends Repository<TeamEntity> {
  constructor(
    @InjectRepository(TeamEntity)
    baseRepository: Repository<TeamEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }
}
