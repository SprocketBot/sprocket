import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SeasonEntity } from './season.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeasonRepository extends Repository<SeasonEntity> {
	constructor(
		@InjectRepository(SeasonEntity)
		baseRepository: Repository<SeasonEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
