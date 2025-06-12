import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrganizationSeatAssignmentEntity } from '../../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrganizationSeatAssignmentRepository extends Repository<OrganizationSeatAssignmentEntity> {
	constructor(
		@InjectRepository(OrganizationSeatAssignmentEntity)
		baseRepository: Repository<OrganizationSeatAssignmentEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
