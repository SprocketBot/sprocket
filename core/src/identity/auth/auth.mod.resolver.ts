import {
    Args, Mutation, Resolver,
} from "@nestjs/graphql";

import {AnonymousAuthService} from "./anonymous-auth";
import {UseGuards} from "@nestjs/common";
import {GqlJwtGuard} from "./gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../../mledb";
import {MLE_OrganizationTeam} from "../../database/mledb";

@Resolver()
export class AuthModuleResolver {
    constructor(private readonly anonAuthService: AnonymousAuthService) {}

    @Mutation(() => String, {description: "Used for development, this provides a bare minimum JWT based on an arbitrary username input"})
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    anonymousLogin(@Args("username") username: string): string {
        return this.anonAuthService.generateAnonymousJwt(username);
    }
}
