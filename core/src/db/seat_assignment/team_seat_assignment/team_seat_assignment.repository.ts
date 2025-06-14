import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamSeatAssignmentEntity } from '../../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeamSeatAssignmentRepository extends Repository<TeamSeatAssignmentEntity> {
	constructor(
		@InjectRepository(TeamSeatAssignmentEntity)
		baseRepository: Repository<TeamSeatAssignmentEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
