import { Args, Query, Resolver, ResolveField, Root, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CreateSeasonInput, PaginatedSeasons, SeasonFilters, SeasonObject, SeasonSort, UpdateSeasonInput } from './season.object';
import { SeasonService } from './season.service';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { AuthPossession, UsePermissions } from 'nest-authz';
import { OffsetPagination } from '../shared/pagination.object';

@Resolver(() => SeasonObject)
export class SeasonResolver {
	constructor(private readonly seasonService: SeasonService) { }

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
	@UsePermissions({
		resource: Resource.Season,
		action: ResourceAction.Read,
		possession: AuthPossession.ANY,
	})
	@Query(() => PaginatedSeasons)
	async seasons(
		@Args('pagination', { nullable: true }) pagination: OffsetPagination = { offset: 0, limit: 25 },
		@Args('filter', { nullable: true }) filter?: SeasonFilters,
		@Args('sort', { nullable: true }) sort?: SeasonSort,
	): Promise<PaginatedSeasons> {
		const [items, total] = await this.seasonService.getSeasonsPaginated(pagination, filter, sort);
		return {
			items: items as unknown as SeasonObject[],
			total,
			offset: pagination.offset,
			limit: pagination.limit,
		};
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
	@UsePermissions({
		resource: Resource.Season,
		action: ResourceAction.Read,
		possession: AuthPossession.ANY,
	})
	@Query(() => SeasonObject)
	async season(@Args('id') id: string): Promise<SeasonObject> {
		const entity = await this.seasonService.getSeasonById(id);
		return entity as unknown as SeasonObject;
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Create }))
	@UsePermissions({
		resource: Resource.Season,
		action: ResourceAction.Create,
		possession: AuthPossession.ANY,
	})
	@Mutation(() => SeasonObject)
	async createSeason(@Args('data') data: CreateSeasonInput): Promise<SeasonObject> {
		const entity = await this.seasonService.createSeason(data);
		return entity as unknown as SeasonObject;
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Update }))
	@UsePermissions({
		resource: Resource.Season,
		action: ResourceAction.Update,
		possession: AuthPossession.ANY,
	})
	@Mutation(() => SeasonObject)
	async updateSeason(
		@Args('id') id: string,
		@Args('data') data: UpdateSeasonInput,
	): Promise<SeasonObject> {
		const entity = await this.seasonService.updateSeason(id, data);
		return entity as unknown as SeasonObject;
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Delete }))
	@UsePermissions({
		resource: Resource.Season,
		action: ResourceAction.Delete,
		possession: AuthPossession.ANY,
	})
	@Mutation(() => SeasonObject)
	async deleteSeason(@Args('id') id: string): Promise<SeasonObject> {
		const entity = await this.seasonService.deleteSeason(id);
		return entity as unknown as SeasonObject;
	}
}
