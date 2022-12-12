import {Inject, UseGuards} from "@nestjs/common";
import {Args, Int, Mutation, Query, Resolver, Subscription} from "@nestjs/graphql";
import type {Scrim as IScrim} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {MLE_OrganizationTeam} from "$mledb";

import {GraphQLJwtAuthGuard} from "../../../authentication/guards";
import {MLEOrganizationTeamGuard} from "../../../mledb/mledb-player/mle-organization-team.guard";
import {ScrimPubSub} from "../constants";
import {ScrimService} from "../scrim.service";
import {Scrim, ScrimEvent} from "../types";

@Resolver()
export class ScrimManagementResolver {
    constructor(private readonly scrimService: ScrimService, @Inject(ScrimPubSub) private readonly pubSub: PubSub) {}

    @Query(() => [Scrim])
    async getActiveScrims(
        @Args("organizationId", {
            type: () => Int,
            nullable: true,
        })
        organizationId: number,
        @Args("skillGroupIds", {
            type: () => [Int],
            nullable: true,
        })
        skillGroupIds: number[],
    ): Promise<IScrim[]> {
        return this.scrimService.getAllScrims(organizationId, skillGroupIds);
    }

    @Mutation(() => Scrim)
    @UseGuards(GraphQLJwtAuthGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async cancelScrim(@Args("scrimId", {type: () => String}) scrimId: string): Promise<IScrim> {
        return this.scrimService.cancelScrim(scrimId);
    }

    @Subscription(() => ScrimEvent)
    async followActiveScrims(): Promise<AsyncIterator<ScrimEvent>> {
        await this.scrimService.enableSubscription();
        return this.pubSub.asyncIterator(this.scrimService.allActiveScrimsSubTopic);
    }
}
