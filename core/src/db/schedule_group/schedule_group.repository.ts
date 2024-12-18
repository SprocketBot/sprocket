import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ScheduleGroupEntity } from './schedule_group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../base.repository';

@Injectable()
export class ScheduleGroupRepository extends BaseRepository<ScheduleGroupEntity> {
  constructor(
    @InjectRepository(ScheduleGroupEntity)
    baseRepository: Repository<ScheduleGroupEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }
}
