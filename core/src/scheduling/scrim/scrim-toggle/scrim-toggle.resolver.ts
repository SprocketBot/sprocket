import {Inject, UseGuards} from "@nestjs/common";
import {Args, Mutation, Query, Resolver, Subscription} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";

import {GraphQLJwtAuthGuard} from "../../../authentication/guards";
import {MLE_OrganizationTeam} from "../../../mledb/database";
import {MLEOrganizationTeamGuard} from "../../../mledb/mledb-player/mle-organization-team.guard";
import {PubSubKey} from "../../../types/pubsub.constants";
import {ScrimToggleService} from "./scrim-toggle.service";

@Resolver()
export class ScrimToggleResolver {
    constructor(
        private readonly scrimToggleService: ScrimToggleService,
        @Inject(PubSubKey.Scrims) private readonly pubSub: PubSub,
    ) {}

    @Query(() => Boolean)
    async getScrimsDisabled(): Promise<boolean> {
        return this.scrimToggleService.scrimsAreDisabled();
    }

    @Mutation(() => Boolean)
    @UseGuards(GraphQLJwtAuthGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async setScrimsDisabled(@Args("disabled") disabled: boolean): Promise<boolean> {
        return disabled ? this.scrimToggleService.disableScrims() : this.scrimToggleService.enableScrims();
    }

    @Subscription(() => Boolean)
    async followScrimsDisabled(): Promise<AsyncIterator<boolean>> {
        await this.scrimToggleService.enableSubscription();
        return this.pubSub.asyncIterator(this.scrimToggleService.scrimsDisabledSubTopic);
    }
}
