import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SeatEntity } from './seat.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeatRepository extends Repository<SeatEntity> {
  constructor(
    @InjectRepository(SeatEntity)
    baseRepository: Repository<SeatEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }
}
