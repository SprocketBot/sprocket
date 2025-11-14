import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormBootstrapService } from './typeorm-bootstrap/typeorm-bootstrap.service';
import { SprocketConfigService } from '@sprocketbot/lib';

import {
	GameEntity,
	GameModeEntity,
	SkillGroupEntity,
	MatchEntity,
	ScrimEntity,
	PlayerEntity,
	LogsEntity,
	MetricsEntity,
	ScrimQueueEntity,
	ScrimTimeoutEntity,
	LogsRepository,
	MetricsRepository,
	ScrimQueueRepository,
	ScrimTimeoutRepository,
	ScrimRepository,
	PlayerRepository,
	GameRepository,
	GameModeRepository,
	SkillGroupRepository
} from './internal';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			inject: [SprocketConfigService],
			useClass: TypeormBootstrapService
		}),
		TypeOrmModule.forFeature([
			GameEntity,
			GameModeEntity,
			SkillGroupEntity,
			MatchEntity,
			ScrimEntity,
			PlayerEntity,
			LogsEntity,
			MetricsEntity,
			ScrimQueueEntity,
			ScrimTimeoutEntity
		])
	],
	providers: [
		LogsRepository,
		MetricsRepository,
		ScrimQueueRepository,
		ScrimTimeoutRepository,
		ScrimRepository,
		PlayerRepository,
		GameRepository,
		GameModeRepository,
		SkillGroupRepository
	],
	exports: [
		LogsRepository,
		MetricsRepository,
		ScrimQueueRepository,
		ScrimTimeoutRepository,
		ScrimRepository,
		PlayerRepository,
		GameRepository,
		GameModeRepository,
		SkillGroupRepository
	]
})
export class DbModule { }
