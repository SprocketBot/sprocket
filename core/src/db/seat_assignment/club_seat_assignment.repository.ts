import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClubSeatAssignmentEntity } from './club_seat_assignment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClubSeatAssignmentRepository extends Repository<ClubSeatAssignmentEntity> {
  constructor(
    @InjectRepository(ClubSeatAssignmentEntity)
    baseRepository: Repository<ClubSeatAssignmentEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }
}
