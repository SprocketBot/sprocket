import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { TeamObject } from './team.object';

@Resolver(() => TeamObject)
export class TeamResolver {
  @ResolveField()
  async getTeam(): Promise<TeamObject> {
    throw new Error('Not yet implemented');
  }
}