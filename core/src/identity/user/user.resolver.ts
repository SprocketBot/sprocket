import {UseGuards} from "@nestjs/common";
import {
    Args, Int, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {JwtService} from "@nestjs/jwt";
import {config} from "@sprocketbot/common";

import type {UserAuthenticationAccount, UserProfile} from "../../database";
import {
    Member, User, UserAuthenticationAccountType,
} from "../../database";
import {MLE_OrganizationTeam} from "../../database/mledb";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {PopulateService} from "../../util/populate/populate.service";
import type {AuthPayload} from "../auth";
import {UserPayload} from "../auth";
import {CurrentUser} from "../auth/current-user.decorator";
import {GqlJwtGuard} from "../auth/gql-auth-guard";
import {IdentityService} from "../identity.service";
import {UserService} from "./user.service";

@Resolver(() => User)
export class UserResolver {
    constructor(
        private readonly identityService: IdentityService,
        private readonly userService: UserService,
        private readonly popService: PopulateService,
        private readonly jwtService: JwtService,
    ) {}

    @Query(() => User)
    @UseGuards(GqlJwtGuard)
    async me(@CurrentUser() cu: UserPayload): Promise<User> {
        return this.userService.getUserById(cu.userId);
    }

    @Query(() => User, {nullable: true})
    async getUserByAuthAccount(
        @Args("accountId") accountId: string,
        @Args("accountType", {type: () => UserAuthenticationAccountType}) accountType: UserAuthenticationAccountType,
    ): Promise<User | null> {
        return this.identityService.getUserByAuthAccount(accountType, accountId);
    }

    @Mutation(() => User)
    async registerUser(
        @Args("accountId") accountId: string,
        @Args("accountType", {type: () => UserAuthenticationAccountType}) accountType: UserAuthenticationAccountType,
    ): Promise<User> {
        return this.identityService.registerUser(accountType, accountId);
    }

    @ResolveField()
    async authenticationAccounts(@Root() user: Partial<User>): Promise<UserAuthenticationAccount[]> {
        if (!Array.isArray(user.authenticationAccounts)) {
            return this.identityService.getAuthAccountsForUser(user.id!);
        }
        return user.authenticationAccounts;
    }

    @ResolveField()
    async profile(@Root() user: Partial<User>): Promise<UserProfile> {
        return user.profile ?? await this.userService.getUserProfileForUser(user.id!);
    }

    @ResolveField()
    async members(@Root() user: User, @Args("orgId", {nullable: true}) orgId?: number): Promise<Member[]> {
        if (!user.members) {
            // eslint-disable-next-line require-atomic-updates
            user.members = await this.popService.populateMany(User, user, "members");
        }
        if (!orgId) return user.members;
        // Ensure organization is populated on all the members, then filter
        return Promise.all(user.members.map(async m => {
            if (typeof m.organization?.id === "undefined") {
                // eslint-disable-next-line require-atomic-updates
                m.organization = await this.popService.populateOneOrFail(Member, m, "organization");
            }

            return m;
        })).then(results => results.filter(m => m.organization.id === orgId));
    }

    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    @Mutation(() => String)
    async loginAsUser(@Args("userId", {type: () => Int}) userId: number, @Args("organizationId", {type: () => Int, nullable: true}) organizationId?: number): Promise<string> {
        const user = await this.userService.getUserById(userId, {relations: {profile: true} });
        const payload: AuthPayload = {
            sub: `${user.id}`,
            username: user.profile.displayName,
            userId: user.id,
            currentOrganizationId: organizationId ?? config.defaultOrganizationId,
        };

        return this.jwtService.sign(payload, {expiresIn: "5m"});
    }
}
