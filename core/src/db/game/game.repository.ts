import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GameEntity } from '../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameRepository extends Repository<GameEntity> {
	constructor(
		@InjectRepository(GameEntity)
		baseRepository: Repository<GameEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
