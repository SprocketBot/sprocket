import {UseGuards} from "@nestjs/common";
import {Args, Mutation, Resolver} from "@nestjs/graphql";

import {OrganizationRepository} from "$repositories";

import {AuthenticationService} from "./authentication.service";
import {AuthenticatedUser} from "./decorators";
import {GraphQLJwtAuthGuard, GraphQLJwtRefreshGuard} from "./strategies/jwt/guards";
import {JwtAuthPayload, JwtRefreshPayload, JwtTokenSet} from "./types";

@Resolver()
export class AuthenticationResolver {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly organizationRepository: OrganizationRepository,
    ) {}

    @Mutation(() => JwtTokenSet)
    @UseGuards(GraphQLJwtRefreshGuard)
    async refreshLogin(@AuthenticatedUser() user: JwtRefreshPayload): Promise<JwtTokenSet> {
        return this.authenticationService.login(user.userId, user.currentOrganizationId);
    }

    @Mutation(() => JwtTokenSet)
    @UseGuards(GraphQLJwtAuthGuard)
    async switchOrganization(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("organizationId") organizationId: number,
    ): Promise<JwtTokenSet> {
        const organization = await this.organizationRepository.getById(organizationId);
        return this.authenticationService.login(user.userId, organization.id);
    }
}
