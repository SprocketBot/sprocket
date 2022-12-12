import {UseGuards} from "@nestjs/common";
import {Args, Int, Mutation, Resolver} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import {MemberRepository} from "$repositories";

import {AuthenticationService} from "./authentication.service";
import {AuthenticatedUser} from "./decorators";
import {GraphQLJwtAuthGuard, GraphQLJwtRefreshGuard} from "./strategies/jwt/guards";
import {JwtAuthPayload, JwtRefreshPayload, JwtTokenSet} from "./types";

@Resolver()
export class AuthenticationResolver {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly memberRepository: MemberRepository,
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
        @Args("organizationId", {type: () => Int}) organizationId: number,
    ): Promise<JwtTokenSet> {
        const member = await this.memberRepository.getOrNull({
            where: {
                userId: user.userId,
                organizationId: organizationId,
            },
        });
        if (!member) throw new GraphQLError("User is not a member of the organization");

        return this.authenticationService.login(user.userId, member.organizationId);
    }
}
