import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlayerEntity } from '../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PlayerRepository extends Repository<PlayerEntity> {
	constructor(
		@InjectRepository(PlayerEntity)
		baseRepository: Repository<PlayerEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
