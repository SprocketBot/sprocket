import {Logger, UseGuards} from "@nestjs/common";
import {
    Args, Int, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {JwtService} from "@nestjs/jwt";
import {config} from "@sprocketbot/common";

import type {Member, UserAuthenticationAccount, UserProfile} from "$models";
import {User} from "$models";
import {UserRepository} from "$repositories";

import {PopulateService} from "../../util/populate/populate.service";
import type {AuthPayload} from "../auth";
import {UserPayload} from "../auth";
import {CurrentUser} from "../auth/current-user.decorator";
import {GqlJwtGuard} from "../auth/gql-auth-guard";

@Resolver(() => User)
export class UserResolver {
    private readonly logger = new Logger(UserResolver.name);

    constructor(
        private readonly identityService: IdentityService,
        private readonly userService: UserService,
        private readonly popService: PopulateService,
        private readonly jwtService: JwtService,
    ) {}

    @Query(() => User)
    @UseGuards(GqlJwtGuard)
    async me(@CurrentUser() cu: UserPayload): Promise<User> {
        return this.userRepository.getById(cu.userId);
    }

    @ResolveField()
    async authenticationAccounts(@Root() user: Partial<User>): Promise<UserAuthenticationAccount[]> {
        return (
            user.authenticationAccounts ??
            (await this.populateService.populateMany(User, user as User, "authenticationAccounts"))
        );
    }

    @ResolveField()
    async profile(@Root() user: Partial<User>): Promise<UserProfile> {
        return user.profile ?? (await this.populateService.populateOneOrFail(User, user as User, "profile"));
    }

    @ResolveField()
    async members(@Root() user: Partial<User>, @Args("orgId", {nullable: true}) orgId?: number): Promise<Member[]> {
        const members = user.members ?? (await this.populateService.populateMany(User, user as User, "members"));
        return orgId ? members.filter(m => m.organizationId === orgId) : members;
    }

    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    @Mutation(() => String)
    async loginAsUser(
        @CurrentUser() authedUser: UserPayload,
        @Args("userId", {type: () => Int}) userId: number,
        @Args("organizationId", {type: () => Int, nullable: true}) organizationId?: number,
    ): Promise<string> {
        const user = await this.userService.getUserById(userId, {relations: {profile: true} });
        const payload: AuthPayload = {
            sub: `${user.id}`,
            username: user.profile.displayName,
            userId: user.id,
            currentOrganizationId: organizationId ?? config.defaultOrganizationId,
            orgTeams: [],
        };

        this.logger.log(`${authedUser.username} (${authedUser.userId}) generated an authentication token for ${user.profile.displayName} (${user.id})`);

        return this.jwtService.sign(payload, {expiresIn: "5m"});
    }
}
