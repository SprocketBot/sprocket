import { Resolver, ResolveField, Root, Args, Query } from '@nestjs/graphql';
import { FranchiseObject } from './franchise.object';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';
import { FranchiseRoleObject } from './franchise-role.object';
import { ClubObject } from '../club/club.object';

@Resolver(() => FranchiseObject)
export class FranchiseResolver {
	constructor(private readonly franchiseRepo: FranchiseRepository) {}

	@Query(() => FranchiseObject)
	async franchise(@Args('id') id: string): Promise<FranchiseObject> {
		return this.franchiseRepo.findOneOrFail({
			where: { id }
		});
	}

	@Query(() => [FranchiseObject])
	async franchises(): Promise<FranchiseObject[]> {
		return this.franchiseRepo.find();
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
