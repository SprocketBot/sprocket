import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'apollo-server-express';

import { MLE_OrganizationTeam } from '../../database/mledb';
import { GqlJwtGuard } from '../../identity/auth/gql-auth-guard';
import { MLEOrganizationTeamGuard } from '../../mledb/mledb-player/mle-organization-team.guard';
import { ScrimPubSub } from '../constants';
import { ScrimToggleService } from './scrim-toggle.service';

@Resolver()
export class ScrimToggleResolver {
  constructor(
    private readonly scrimToggleService: ScrimToggleService,
    @Inject(ScrimPubSub) private readonly pubSub: PubSub,
  ) {}

  @Query(() => Boolean)
  async getScrimsDisabled(): Promise<boolean> {
    return this.scrimToggleService.scrimsAreDisabled();
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
  async setScrimsDisabled(@Args('disabled') disabled: boolean): Promise<boolean> {
    return disabled
      ? this.scrimToggleService.disableScrims()
      : this.scrimToggleService.enableScrims();
  }

  @Subscription(() => Boolean)
  async followScrimsDisabled(): Promise<AsyncIterator<boolean>> {
    await this.scrimToggleService.enableSubscription();
    return this.pubSub.asyncIterator(this.scrimToggleService.scrimsDisabledSubTopic);
  }
}
