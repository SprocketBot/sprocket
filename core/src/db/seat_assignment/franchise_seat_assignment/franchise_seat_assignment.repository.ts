import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FranchiseSeatAssignmentEntity } from '../../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FranchiseSeatAssignmentRepository extends Repository<FranchiseSeatAssignmentEntity> {
	constructor(
		@InjectRepository(FranchiseSeatAssignmentEntity)
		baseRepository: Repository<FranchiseSeatAssignmentEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
