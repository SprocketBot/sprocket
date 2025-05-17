import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { FranchiseObject } from './franchise.object';

@Resolver(() => FranchiseObject)
export class FranchiseResolver {
  @ResolveField()
  async getFranchise(): Promise<FranchiseObject> {
    throw new Error('Not yet implemented');
  }
}
