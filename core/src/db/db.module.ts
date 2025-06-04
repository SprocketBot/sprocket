import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormBootstrapService } from './typeorm-bootstrap/typeorm-bootstrap.service';
import { SprocketConfigService } from '@sprocketbot/lib';
import { GameModeEntity } from './game_mode/game_mode.entity';
import { GameEntity } from './game/game.entity';
import { FixtureEntity, MatchEntity, ScrimEntity } from './match/match.entity';
import { PlayerEntity } from './player/player.entity';
import { PlayerStatEntity } from './player_stat/player_stat.entity';
import { RoundEntity } from './round/round.entity';
import { ScheduleGroupEntity } from './schedule_group/schedule_group.entity';
import { ScheduleGroupTypeEntity } from './schedule_group_type/schedule_group_type.entity';
import { SkillGroupEntity } from './skill_group/skill_group.entity';
import { UserEntity } from './user/user.entity';
import { GameRepository } from './game/game.repository';
import { GameModeRepository } from './game_mode/game_mode.repository';
import { FixtureRepository, MatchRepository, ScrimRepository } from './match/match.repository';
import { PlayerRepository } from './player/player.repository';
import { PlayerStatRepository } from './player_stat/player_stat.repository';
import { RoundRepository } from './round/round.repository';
import { ScheduleGroupRepository } from './schedule_group/schedule_group.repository';
import { ScheduleGroupTypeRepository } from './schedule_group_type/schedule_group_type.repository';
import { SkillGroupRepository } from './skill_group/skill_group.repository';
import { UserRepository } from './user/user.repository';
import { UserAuthAccountEntity } from './user_auth_account/user_auth_account.entity';
import { UserAuthAccountRepository } from './user_auth_account/user_auth_account.repository';
import { RoleEntity } from './role/role.entity';
import { RoleRepository } from './role/role.repository';
import { SeatEntity } from './seat/seat.entity';
import { SeatRepository } from './seat/seat.repository';
import { ClubEntity } from './club/club.entity';
import { ClubRepository } from './club/club.repository';
import { FranchiseEntity } from './franchise/franchise.entity';
import { FranchiseRepository } from './franchise/franchise.repository';
import { ClubSeatAssignmentEntity } from './seat_assignment/club_seat_assignment/club_seat_assignment.entity';
import { ClubSeatAssignmentRepository } from './seat_assignment/club_seat_assignment/club_seat_assignment.repository';
import { FranchiseSeatAssignmentEntity } from './seat_assignment/franchise_seat_assignment/franchise_seat_assignment.entity';
import { FranchiseSeatAssignmentRepository } from './seat_assignment/franchise_seat_assignment/franchise_seat_assignment.repository';
import { TeamSeatAssignmentEntity } from './seat_assignment/team_seat_assignment/team_seat_assignment.entity';
import { TeamSeatAssignmentRepository } from './seat_assignment/team_seat_assignment/team_seat_assignment.repository';
import { TeamEntity } from './team/team.entity';
import { TeamRepository } from './team/team.repository';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			inject: [SprocketConfigService],
			useClass: TypeormBootstrapService
		}),
		TypeOrmModule.forFeature([
			GameEntity,
			GameModeEntity,
			RoleEntity,
			SeatEntity,
			FranchiseEntity,
			FranchiseSeatAssignmentEntity,
			ClubEntity,
			ClubSeatAssignmentEntity,
			TeamEntity,
			TeamSeatAssignmentEntity,
			MatchEntity,
			ScrimEntity,
			FixtureEntity,
			PlayerEntity,
			PlayerStatEntity,
			RoundEntity,
			ScheduleGroupEntity,
			ScheduleGroupTypeEntity,
			SkillGroupEntity,
			UserEntity,
			UserAuthAccountEntity
		])
	],
	providers: [
		GameRepository,
		GameModeRepository,
		RoleRepository,
		SeatRepository,
		FranchiseRepository,
		FranchiseSeatAssignmentRepository,
		ClubRepository,
		ClubSeatAssignmentRepository,
		TeamRepository,
		TeamSeatAssignmentRepository,
		MatchRepository,
		ScrimRepository,
		FixtureRepository,
		PlayerRepository,
		PlayerStatRepository,
		RoundRepository,
		ScheduleGroupRepository,
		ScheduleGroupTypeRepository,
		SkillGroupRepository,
		UserRepository,
		UserAuthAccountRepository
	],
	exports: [
		GameRepository,
		GameModeRepository,
		RoleRepository,
		SeatRepository,
		FranchiseRepository,
		FranchiseSeatAssignmentRepository,
		ClubRepository,
		ClubSeatAssignmentRepository,
		TeamRepository,
		TeamSeatAssignmentRepository,
		MatchRepository,
		ScrimRepository,
		FixtureRepository,
		PlayerRepository,
		PlayerStatRepository,
		RoundRepository,
		ScheduleGroupRepository,
		ScheduleGroupTypeRepository,
		SkillGroupRepository,
		UserRepository,
		UserAuthAccountRepository
	]
})
export class DbModule {}
