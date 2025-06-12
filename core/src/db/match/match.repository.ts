import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FixtureEntity, MatchEntity, ScrimEntity } from '../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MatchRepository extends Repository<MatchEntity> {
	constructor(
		@InjectRepository(MatchEntity)
		baseRepository: Repository<MatchEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}

@Injectable()
export class ScrimRepository extends Repository<ScrimEntity> {
	constructor(
		@InjectRepository(ScrimEntity)
		baseRepository: Repository<ScrimEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}

@Injectable()
export class FixtureRepository extends Repository<FixtureEntity> {
	constructor(
		@InjectRepository(FixtureEntity)
		baseRepository: Repository<FixtureEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
