import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchSubmissionEntity } from './match_submission.entity';

@Injectable()
export class MatchSubmissionRepository extends Repository<MatchSubmissionEntity> {
	constructor(
		@InjectRepository(MatchSubmissionEntity)
		baseRepository: Repository<MatchSubmissionEntity>
	) {
		super(
			baseRepository.target,
			baseRepository.manager,
			baseRepository.queryRunner
		);
	}
}
