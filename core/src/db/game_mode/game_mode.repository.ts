import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GameModeEntity } from './game_mode.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameModeRepository extends Repository<GameModeEntity> {
	constructor(
		@InjectRepository(GameModeEntity)
		baseRepository: Repository<GameModeEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
