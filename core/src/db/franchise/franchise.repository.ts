import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FranchiseEntity } from './franchise.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FranchiseRepository extends Repository<FranchiseEntity> {
	constructor(
		@InjectRepository(FranchiseEntity)
		baseRepository: Repository<FranchiseEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
