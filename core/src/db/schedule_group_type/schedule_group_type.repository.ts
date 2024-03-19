import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ScheduleGroupTypeEntity } from './schedule_group_type.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ScheduleGroupTypeRepository extends Repository<ScheduleGroupTypeEntity> {
  constructor(
    @InjectRepository(ScheduleGroupTypeEntity)
    baseRepository: Repository<ScheduleGroupTypeEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }
}
