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
import { SeasonEntity } from './season/season.entity';
import { RosterSpotEntity } from './roster_spot/roster_spot.entity';
import { RosterOfferEntity } from './roster_offer/roster_offer.entity';
import { FranchiseRoleEntity } from './franchise_role/franchise_role.entity';
import { ClubRoleEntity } from './club_role/club_role.entity';
import { TeamRoleEntity } from './team_role/team_role.entity';
import { RoleEntity } from './role/role.entity';
import { SeatEntity } from './seat/seat.entity';
import { OrganizationSeatAssignmentEntity } from './seat_assignment/organization_seat_assignment/organization_seat_assignment.entity';
import { ClubSeatAssignmentEntity } from './seat_assignment/club_seat_assignment/club_seat_assignment.entity';
import { FranchiseSeatAssignmentEntity } from './seat_assignment/franchise_seat_assignment/franchise_seat_assignment.entity';
import { TeamSeatAssignmentEntity } from './seat_assignment/team_seat_assignment/team_seat_assignment.entity';

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
	ApiTokenUsageLogEntity,
	SeasonRepository,
	RosterSpotRepository,
	RosterOfferRepository,
	FranchiseRoleEntity as FRE,
	RoleRepository,
	MatchRepository,
	TeamStatRepository,
	SeatRepository,
	TeamRepository,
	FranchiseRepository,
	ClubRepository,
	OrganizationSeatAssignmentRepository,
	RoundRepository,
	ScheduleGroupRepository,
	ScheduleGroupTypeRepository,
	PlayerStatRepository,
	MatchSubmissionRepository
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
			TeamEntity,
			SeasonEntity,
			RosterSpotEntity,
			RosterOfferEntity,
			FranchiseRoleEntity,
			ClubRoleEntity,
			TeamRoleEntity,
			RoleEntity,
			SeatEntity,
			OrganizationSeatAssignmentEntity,
			ClubSeatAssignmentEntity,
			FranchiseSeatAssignmentEntity,
			TeamSeatAssignmentEntity,
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
		UserAuthAccountRepository,
		MatchSubmissionRepository,
		SeasonRepository,
		RoleRepository,
		FranchiseRepository,
		ClubRepository,
		MatchRepository,
		PlayerStatRepository,
		RoundRepository,
		ScheduleGroupRepository,
		ScheduleGroupTypeRepository,
		SeatRepository,
		TeamRepository,
		TeamStatRepository,
		OrganizationSeatAssignmentRepository,
		RosterSpotRepository,
		RosterOfferRepository,
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
		UserAuthAccountRepository,
		MatchSubmissionRepository,
		SeasonRepository,
		RoleRepository,
		FranchiseRepository,
		ClubRepository,
		MatchRepository,
		PlayerStatRepository,
		RoundRepository,
		ScheduleGroupRepository,
		ScheduleGroupTypeRepository,
		SeatRepository,
		TeamRepository,
		TeamStatRepository,
		OrganizationSeatAssignmentRepository,
		RosterSpotRepository,
		RosterOfferRepository,
	]
})
export class DbModule { }
