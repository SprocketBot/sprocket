import { Resolver, ResolveField, Root, Args, Query, Mutation } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { TeamFilters, TeamObject, TeamSort, CreateTeamInput, PaginatedTeams, UpdateTeamInput } from './team.object';
import { TeamRepository } from '../../db/team/team.repository';
import { DataAuditAction } from '../../db/internal';
import { AuditService } from '../../audit/audit.service';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { TeamRoleObject } from './team-role.object';
import { RosterSpotObject } from './roster-spot.object';
import { ClubObject } from '../club/club.object';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { AuthPossession, UsePermissions } from 'nest-authz';
import { ClubRepository } from '../../db/club/club.repository';
import { SkillGroupRepository } from '../../db/skill_group/skill_group.repository';
import { OffsetPagination } from '../shared/pagination.object';

@Resolver(() => TeamObject)
export class TeamResolver {
	constructor(
		private readonly teamRepo: TeamRepository,
		private readonly clubRepo: ClubRepository,
		private readonly skillGroupRepo: SkillGroupRepository,
		private readonly auditService: AuditService,
	) { }

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
	@UsePermissions({
		resource: Resource.Team,
		action: ResourceAction.Read,
		possession: AuthPossession.ANY,
	})
	@Query(() => TeamObject)
	async team(@Args('id') id: string): Promise<TeamObject> {
		return this.teamRepo.findOneOrFail({
			where: { id }
		});
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
	@UsePermissions({
		resource: Resource.Team,
		action: ResourceAction.Read,
		possession: AuthPossession.ANY,
	})
	@Query(() => PaginatedTeams)
	async teams(
		@Args('pagination', { nullable: true }) pagination: OffsetPagination = { offset: 0, limit: 25 },
		@Args('filter', { nullable: true }) filter?: TeamFilters,
		@Args('sort', { nullable: true }) sort?: TeamSort,
	): Promise<PaginatedTeams> {
		const [items, total] = await this.teamRepo.findAndCountPaginated(pagination, filter, sort);
		return {
			items,
			total,
			offset: pagination.offset,
			limit: pagination.limit,
		};
	}

	@Mutation(() => TeamObject)
	@UseGuards(AuthorizeGuard({ action: ResourceAction.Create }))
	@UsePermissions({
		resource: Resource.Team,
		action: ResourceAction.Create,
		possession: AuthPossession.ANY,
	})
	async createTeam(@Args('data') data: CreateTeamInput): Promise<TeamObject> {
		const club = await this.clubRepo.findOneBy({ id: data.clubId });
		if (!club) throw new NotFoundException(`Club with ID ${data.clubId} not found`);

		const skillGroup = await this.skillGroupRepo.findOneBy({ id: data.skillGroupId });
		if (!skillGroup) throw new NotFoundException(`SkillGroup with ID ${data.skillGroupId} not found`);

		const team = this.teamRepo.create({
			...data,
			club,
			skillGroup,
		});

		const saved = await this.teamRepo.save(team);
		await this.auditService.log('Team', saved.id, DataAuditAction.CREATE, {
			newData: saved,
		});
		return saved;
	}

	@Mutation(() => TeamObject)
	@UseGuards(AuthorizeGuard({ action: ResourceAction.Update }))
	@UsePermissions({
		resource: Resource.Team,
		action: ResourceAction.Update,
		possession: AuthPossession.ANY,
	})
	async updateTeam(@Args('id') id: string, @Args('data') data: UpdateTeamInput): Promise<TeamObject> {
		const team = await this.teamRepo.findOneBy({ id });
		if (!team) throw new NotFoundException(`Team with ID ${id} not found`);

		const previousData = { ...team };
		if (data.clubId) {
			const club = await this.clubRepo.findOneBy({ id: data.clubId });
			if (!club) throw new NotFoundException(`Club with ID ${data.clubId} not found`);
			team.club = club;
		}

		if (data.skillGroupId) {
			const skillGroup = await this.skillGroupRepo.findOneBy({ id: data.skillGroupId });
			if (!skillGroup) throw new NotFoundException(`SkillGroup with ID ${data.skillGroupId} not found`);
			team.skillGroup = skillGroup;
		}

		Object.assign(team, data);

		const saved = await this.teamRepo.save(team);
		await this.auditService.log('Team', saved.id, DataAuditAction.UPDATE, {
			previousData,
			newData: saved,
		});
		return saved;
	}

	@Mutation(() => TeamObject)
	@UseGuards(AuthorizeGuard({ action: ResourceAction.Delete }))
	@UsePermissions({
		resource: Resource.Team,
		action: ResourceAction.Delete,
		possession: AuthPossession.ANY,
	})
	async deleteTeam(@Args('id') id: string): Promise<TeamObject> {
		const team = await this.teamRepo.findOne({
			where: { id },
			relations: ['rosterSpots'],
		});
		if (!team) throw new NotFoundException(`Team with ID ${id} not found`);

		if (team.rosterSpots?.length) {
			throw new Error('Cannot delete a team with active roster spots');
		}
		const result = await this.teamRepo.softRemove(team);
		await this.auditService.log('Team', id, DataAuditAction.DELETE, {
			previousData: team,
		});
		return result;
	}

	@ResolveField(() => ClubObject)
	async club(@Root() root: Partial<TeamObject>) {
		if (root.club) return root.club;
		const team = await this.teamRepo.findOneByOrFail({ id: root.id });
		return await team.club;
	}

	@ResolveField(() => SkillGroupObject)
	async skillGroup(@Root() root: TeamObject) {
		if (root.skillGroup) return root.skillGroup;
		const team = await this.teamRepo.findOneOrFail({
			where: { id: root.id },
			relations: ['skillGroup'],
		});
		return team.skillGroup;
	}

	@ResolveField(() => [TeamRoleObject])
	async roles(@Root() root: TeamObject): Promise<TeamRoleObject[]> {
		if (root.roles) return root.roles;
		const team = await this.teamRepo.findOne({
			where: { id: root.id },
			relations: ['roles', 'roles.user'],
		});
		return (team?.roles as unknown as TeamRoleObject[]) ?? [];
	}

	@ResolveField(() => [RosterSpotObject])
	async rosterSpots(@Root() root: TeamObject): Promise<RosterSpotObject[]> {
		if (root.rosterSpots) return root.rosterSpots;
		const team = await this.teamRepo.findOne({
			where: { id: root.id },
			relations: ['rosterSpots', 'rosterSpots.player', 'rosterSpots.player.user'],
		});
		return (team?.rosterSpots as unknown as RosterSpotObject[]) ?? [];
	}
}
