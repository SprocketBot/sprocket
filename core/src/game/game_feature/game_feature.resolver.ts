import {UseGuards} from "@nestjs/common";
import {
    Args, Mutation, Query, Resolver,
} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import {EnabledFeature, FeatureCode} from "../../database";
import {MLE_OrganizationTeam} from "../../database/mledb";
import {CurrentUser} from "../../identity/auth/current-user.decorator";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard/gql-jwt-guard";
import {UserPayload} from "../../identity/auth/oauth/types/userpayload.type";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {GameFeatureService} from "./game_feature.service";

@Resolver()
export class GameFeatureResolver {
    constructor(private readonly gameFeatureService: GameFeatureService) {}

    @Query(() => Boolean)
    async getFeatureEnabled(
        @CurrentUser() user: UserPayload,
        @Args("code", {type: () => FeatureCode}) code: FeatureCode,
        @Args("gameId") gameId: number,
    ): Promise<boolean> {
        if (!user.currentOrganizationId) throw new GraphQLError(`User is not related to an organization`);
        return this.gameFeatureService.featureIsEnabled(code, gameId, user.currentOrganizationId);
    }

    @Mutation(() => EnabledFeature)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async enableFeature(
        @CurrentUser() user: UserPayload,
        @Args("code", {type: () => FeatureCode}) code: FeatureCode,
        @Args("gameId") gameId: number,
    ): Promise<EnabledFeature> {
        if (!user.currentOrganizationId) throw new GraphQLError(`User is not related to an organization`);
        return this.gameFeatureService.enableFeature(code, gameId, user.currentOrganizationId);
    }

    @Mutation(() => EnabledFeature)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async disableFeature(
        @CurrentUser() user: UserPayload,
        @Args("code", {type: () => FeatureCode}) code: FeatureCode,
        @Args("gameId") gameId: number,
    ): Promise<EnabledFeature> {
        if (!user.currentOrganizationId) throw new GraphQLError(`User is not related to an organization`);
        return this.gameFeatureService.disableFeature(code, gameId, user.currentOrganizationId);
    }
}
