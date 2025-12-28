import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamStatEntity } from './team_stat.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeamStatRepository extends Repository<TeamStatEntity> {
	constructor(
		@InjectRepository(TeamStatEntity)
		baseRepository: Repository<TeamStatEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
