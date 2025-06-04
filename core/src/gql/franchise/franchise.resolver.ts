import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { FranchiseObject } from './franchise.object';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';

@Resolver(() => FranchiseObject)
export class FranchiseResolver {
	constructor(private readonly franchiseRepo: FranchiseRepository) {}
	/*TODO
	
	@Query()
	async franchise(@Args('id') id: string, @Args('name') name?: string): Promise<FranchiseObject> {
		const franchise = await this.franchiseRepo.findOneBy({
			id,
			name
		});
		return franchise;
	}
*/
	@ResolveField()
	async club(@Root() root: Partial<FranchiseObject>) {
		if (root.clubs) return root.clubs;
		const franchise = await this.franchiseRepo.findOneByOrFail({ id: root.id });
		return await franchise.clubs;
	}
}
