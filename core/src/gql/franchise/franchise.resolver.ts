import { Resolver, ResolveField, Args, Query } from '@nestjs/graphql';
import { FranchiseObject } from './franchise.object';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';

@Resolver(() => FranchiseObject)
export class FranchiseResolver {
	constructor(private readonly franchiseRepo: FranchiseRepository) {}
	@Query()
	async franchise(@Args('id') id: string, @Args('name') name?: string): Promise<FranchiseObject> {
		const franchise = await this.franchiseRepo.findOneBy({
			id,
			name
		});
		return franchise;
	}
}
