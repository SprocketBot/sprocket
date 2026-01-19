import { Args, Mutation, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { ClubFilters, ClubObject, ClubSort, CreateClubInput, PaginatedClubs, UpdateClubInput } from './club.object';
import { ClubRepository } from '../../db/club/club.repository';
import { DataAuditAction } from '../../db/internal';
import { AuditService } from '../../audit/audit.service';
import { GameObject } from '../game/game.object';
import { FranchiseObject } from '../franchise/franchise.object';
import { TeamObject } from '../team/team.object';
import { ClubRoleObject } from './club-role.object';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { AuthPossession, UsePermissions } from 'nest-authz';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';
import { GameRepository } from '../../db/game/game.repository';
import { OffsetPagination } from '../shared/pagination.object';

@Resolver(() => ClubObject)
export class ClubResolver {
	constructor(
		private readonly clubRepo: ClubRepository,
		private readonly franchiseRepo: FranchiseRepository,
		private readonly gameRepo: GameRepository,
		private readonly auditService: AuditService,
	) { }

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
	@UsePermissions({
		resource: Resource.Club,
		action: ResourceAction.Read,
		possession: AuthPossession.ANY,
	})
	@Query(() => ClubObject)
	async club(@Args('id') id: string): Promise<ClubObject> {
		return this.clubRepo.findOneOrFail({
			where: { id }
		});
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
	@UsePermissions({
		resource: Resource.Club,
		action: ResourceAction.Read,
		possession: AuthPossession.ANY,
	})
	@Query(() => PaginatedClubs)
	async clubs(
		@Args('pagination', { nullable: true }) pagination: OffsetPagination = { offset: 0, limit: 25 },
		@Args('filter', { nullable: true }) filter?: ClubFilters,
		@Args('sort', { nullable: true }) sort?: ClubSort,
	): Promise<PaginatedClubs> {
		const [items, total] = await this.clubRepo.findAndCountPaginated(pagination, filter, sort);
		return {
			items,
			total,
			offset: pagination.offset,
			limit: pagination.limit,
		};
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Create }))
	@UsePermissions({
		resource: Resource.Club,
		action: ResourceAction.Create,
		possession: AuthPossession.ANY,
	})
	@Mutation(() => ClubObject)
	async createClub(@Args('data') data: CreateClubInput): Promise<ClubObject> {
		const franchise = await this.franchiseRepo.findOneBy({ id: data.franchiseId });
		if (!franchise) throw new NotFoundException('Franchise not found');

		const game = await this.gameRepo.findOneBy({ id: data.gameId });
		if (!game) throw new NotFoundException('Game not found');

		const club = this.clubRepo.create({
			name: data.name,
			slug: data.slug,
			franchise,
			game,
		});

		const saved = await this.clubRepo.save(club);
		await this.auditService.log('Club', saved.id, DataAuditAction.CREATE, {
			newData: saved,
		});
		return saved;
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Update }))
	@UsePermissions({
		resource: Resource.Club,
		action: ResourceAction.Update,
		possession: AuthPossession.ANY,
	})
	@Mutation(() => ClubObject)
	async updateClub(
		@Args('id') id: string,
		@Args('data') data: UpdateClubInput,
	): Promise<ClubObject> {
		const club = await this.clubRepo.findOneBy({ id });
		if (!club) throw new NotFoundException('Club not found');

		const previousData = { ...club };
		Object.assign(club, data);
		const saved = await this.clubRepo.save(club);
		await this.auditService.log('Club', saved.id, DataAuditAction.UPDATE, {
			previousData,
			newData: saved,
		});
		return saved;
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Delete }))
	@UsePermissions({
		resource: Resource.Club,
		action: ResourceAction.Delete,
		possession: AuthPossession.ANY,
	})
	@Mutation(() => ClubObject)
	async deleteClub(@Args('id') id: string): Promise<ClubObject> {
		const club = await this.clubRepo.findOne({
			where: { id },
			relations: ['teams'],
		});
		if (!club) throw new NotFoundException('Club not found');

		if (club.teams?.length) {
			throw new Error('Cannot delete a club with active teams');
		}
		const result = await this.clubRepo.softRemove(club);
		await this.auditService.log('Club', id, DataAuditAction.DELETE, {
			previousData: club,
		});
		return result;
	}

	@ResolveField(() => FranchiseObject)
	async franchise(@Root() root: Partial<ClubObject>) {
		if (root.franchise) return root.franchise;
		const club = await this.clubRepo.findOneByOrFail({ id: root.id });
		return await club.franchise;
	}

	@ResolveField(() => GameObject)
	async game(@Root() root: Partial<ClubObject>) {
		if (root.game) return root.game;
		const club = await this.clubRepo.findOneByOrFail({ id: root.id });
		return await club.game;
	}

	@ResolveField(() => [TeamObject])
	async teams(@Root() root: ClubObject) {
		if (root.teams) return root.teams;
		const club = await this.clubRepo.findOne({
			where: { id: root.id },
			relations: ['teams'],
		});
		return club?.teams ?? [];
	}

	@ResolveField(() => [ClubRoleObject])
	async roles(@Root() root: ClubObject): Promise<ClubRoleObject[]> {
		if (root.roles) return root.roles;
		const club = await this.clubRepo.findOne({
			where: { id: root.id },
			relations: ['roles', 'roles.user'],
		});
		return (club?.roles as unknown as ClubRoleObject[]) ?? [];
	}
}
