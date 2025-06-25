import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RoundEntity } from '../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoundRepository extends Repository<RoundEntity> {
	constructor(
		@InjectRepository(RoundEntity)
		baseRepository: Repository<RoundEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
