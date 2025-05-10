import { ResolveField, Resolver } from '@nestjs/graphql';
import { FranchiseObject } from './franchise.object';

@Resolver(() => FranchiseObject)
export class FranchiseResolver {
  @ResolveField(() => FranchiseObject)
  async getFranchise(id: number): Promise<FranchiseObject> {
    throw new Error('Not yet implemented');
  }
}
