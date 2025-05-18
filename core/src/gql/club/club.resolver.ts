import { ResolveField, Resolver } from '@nestjs/graphql';
import { ClubObject } from './club.object';

@Resolver(() => ClubObject)
export class ClubResolver {
  @ResolveField()
  async getClub(): Promise<ClubObject> {
    throw new Error('Not yet implemented');
  }
}
