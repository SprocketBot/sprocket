import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClubRepository extends Repository<ClubEntity> {
  constructor(
    @InjectRepository(ClubEntity)
    baseRepository: Repository<ClubEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }
}
