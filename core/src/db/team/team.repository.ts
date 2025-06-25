import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamEntity } from '../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeamRepository extends Repository<TeamEntity> {
	constructor(
		@InjectRepository(TeamEntity)
		baseRepository: Repository<TeamEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
