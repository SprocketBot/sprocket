import { Resolver, ResolveField, Root, Args, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CreateFranchiseInput, FranchiseFilters, FranchiseObject, FranchiseSort, PaginatedFranchises, UpdateFranchiseInput } from './franchise.object';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';
import { DataAuditAction } from '../../db/internal';
import { AuditService } from '../../audit/audit.service';
import { FranchiseRoleObject } from './franchise-role.object';
import { ClubObject } from '../club/club.object';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { AuthPossession, UsePermissions } from 'nest-authz';
import { OffsetPagination } from '../shared/pagination.object';

@Resolver(() => FranchiseObject)
export class FranchiseResolver {
	constructor(
		private readonly franchiseRepo: FranchiseRepository,
		private readonly auditService: AuditService,
	) { }

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
	@UsePermissions({
		resource: Resource.Franchise,
		action: ResourceAction.Read,
		possession: AuthPossession.ANY,
	})
	@Query(() => FranchiseObject)
	async franchise(@Args('id') id: string): Promise<FranchiseObject> {
		return this.franchiseRepo.findOneOrFail({
			where: { id }
		});
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
	@UsePermissions({
		resource: Resource.Franchise,
		action: ResourceAction.Read,
		possession: AuthPossession.ANY,
	})
	@Query(() => PaginatedFranchises)
	async franchises(
		@Args('pagination', { nullable: true }) pagination: OffsetPagination = { offset: 0, limit: 25 },
		@Args('filter', { nullable: true }) filter?: FranchiseFilters,
		@Args('sort', { nullable: true }) sort?: FranchiseSort,
	): Promise<PaginatedFranchises> {
		const [items, total] = await this.franchiseRepo.findAndCountPaginated(pagination, filter, sort);
		return {
			items,
			total,
			offset: pagination.offset,
			limit: pagination.limit,
		};
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Create }))
	@UsePermissions({
		resource: Resource.Franchise,
		action: ResourceAction.Create,
		possession: AuthPossession.ANY,
	})
	@Mutation(() => FranchiseObject)
	async createFranchise(@Args('data') data: CreateFranchiseInput): Promise<FranchiseObject> {
		const franchise = this.franchiseRepo.create(data);
		const saved = await this.franchiseRepo.save(franchise);
		await this.auditService.log('Franchise', saved.id, DataAuditAction.CREATE, {
			newData: saved,
		});
		return saved;
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Update }))
	@UsePermissions({
		resource: Resource.Franchise,
		action: ResourceAction.Update,
		possession: AuthPossession.ANY,
	})
	@Mutation(() => FranchiseObject)
	async updateFranchise(
		@Args('id') id: string,
		@Args('data') data: UpdateFranchiseInput,
	): Promise<FranchiseObject> {
		const franchise = await this.franchiseRepo.findOneOrFail({ where: { id } });
		const previousData = { ...franchise };
		Object.assign(franchise, data);
		const saved = await this.franchiseRepo.save(franchise);
		await this.auditService.log('Franchise', saved.id, DataAuditAction.UPDATE, {
			previousData,
			newData: saved,
		});
		return saved;
	}

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Delete }))
	@UsePermissions({
		resource: Resource.Franchise,
		action: ResourceAction.Delete,
		possession: AuthPossession.ANY,
	})
	@Mutation(() => FranchiseObject)
	async deleteFranchise(@Args('id') id: string): Promise<FranchiseObject> {
		const franchise = await this.franchiseRepo.findOneOrFail({
			where: { id },
			relations: ['clubs'],
		});
		if (franchise.clubs?.length) {
			throw new Error('Cannot delete a franchise with active clubs');
		}
		const result = await this.franchiseRepo.softRemove(franchise);
		await this.auditService.log('Franchise', id, DataAuditAction.DELETE, {
			previousData: franchise,
		});
		return result;
	}

	@ResolveField(() => [ClubObject])
	async clubs(@Root() root: FranchiseObject) {
		if (root.clubs) return root.clubs;
		const franchise = await this.franchiseRepo.findOne({
			where: { id: root.id },
			relations: ['clubs'],
		});
		return franchise?.clubs ?? [];
	}

	@ResolveField(() => [FranchiseRoleObject])
	async roles(@Root() root: FranchiseObject): Promise<FranchiseRoleObject[]> {
		if (root.roles) return root.roles;
		const franchise = await this.franchiseRepo.findOne({
			where: { id: root.id },
			relations: ['roles', 'roles.user'],
		});
		return (franchise?.roles as unknown as FranchiseRoleObject[]) ?? [];
	}
}
