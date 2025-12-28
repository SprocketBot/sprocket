import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RosterSpotEntity } from './roster_spot.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RosterSpotRepository extends Repository<RosterSpotEntity> {
	constructor(
		@InjectRepository(RosterSpotEntity)
		baseRepository: Repository<RosterSpotEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
