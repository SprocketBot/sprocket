import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormBootstrapService } from './typeorm-bootstrap/typeorm-bootstrap.service';
import { SprocketConfigService } from '@sprocketbot/lib';

import { ScrimRepository } from './scrim/scrim.repository';
import { ScrimEntity } from './scrim/scrim.entity';
import { MatchEntity } from './match/match.entity';
import { PlayerEntity } from './player/player.entity';
import { UserEntity } from './user/user.entity';
import { GameEntity } from './game/game.entity';
import { GameModeEntity } from './game_mode/game_mode.entity';
import { SkillGroupEntity } from './skill_group/skill_group.entity';
import { UserRepository } from './user/user.repository';
import { UserAuthAccountRepository } from './user_auth_account/user_auth_account.repository';
import { UserAuthAccountEntity } from './user_auth_account/user_auth_account.entity';
import { FixtureEntity } from './match/fixture.entity';
import { FranchiseEntity } from './franchise/franchise.entity';
import { ClubEntity } from './club/club.entity';
import { TeamEntity } from './team/team.entity';

import {


	LogsEntity,
	MetricsEntity,
	ScrimQueueEntity,
	ScrimTimeoutEntity,
	MatchSubmissionEntity,
	RoundEntity,
	ScheduleGroupEntity,
	ScheduleGroupTypeEntity,
	TeamStatEntity,
	EventQueue,
	UserNotificationPreferenceEntity,
	NotificationHistoryEntity,
	NotificationTemplateEntity,
	PlayerStatEntity,
	LogsRepository,
	MetricsRepository,
	ScrimQueueRepository,
	ScrimTimeoutRepository,

	PlayerRepository,
	GameRepository,
	GameModeRepository,
	SkillGroupRepository,
	CasbinRule,
	RoleDefinition,
	UserRole,
	PermissionAuditLog,
	ApiTokenEntity,
	ApiTokenUsageLogEntity
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
			ScrimTimeoutEntity,
			MatchSubmissionEntity,
			RoundEntity,
			ScheduleGroupEntity,
			ScheduleGroupTypeEntity,
			TeamStatEntity,
			EventQueue,
			UserNotificationPreferenceEntity,
			NotificationHistoryEntity,
			NotificationTemplateEntity,
			PlayerStatEntity,
			UserAuthAccountEntity,
			UserEntity,
			CasbinRule,
			RoleDefinition,
			UserRole,
			PermissionAuditLog,
			ApiTokenEntity,
			ApiTokenUsageLogEntity,
			FixtureEntity,
			FranchiseEntity,
			ClubEntity,
			TeamEntity
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
		SkillGroupRepository,
		UserRepository,
		UserAuthAccountRepository
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
		SkillGroupRepository,
		UserRepository,
		UserAuthAccountRepository
	]
})
export class DbModule { }
