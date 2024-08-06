import {Logger, UseGuards} from "@nestjs/common";
import {
    Args, Int, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {JwtService} from "@nestjs/jwt";
import {config} from "@sprocketbot/common";

import type {
    UserAuthenticationAccount, UserProfile,
} from "../../database";
import {
    Member, User, UserAuthenticationAccountType,
} from "../../database";
import {MLE_OrganizationTeam} from "../../database/mledb";
import {PlayerService} from "../../franchise";
import {IntakePlayerAccount} from "../../franchise/player/player.resolver";
import {CreatePlayerTuple} from "../../franchise/player/player.types";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {MemberService} from "../../organization";
import {PopulateService} from "../../util/populate/populate.service";
import type {AuthPayload} from "../auth";
import {UserPayload} from "../auth";
import {CurrentUser} from "../auth/current-user.decorator";
import {GqlJwtGuard} from "../auth/gql-auth-guard";
import {IdentityService} from "../identity.service";
import {UserService} from "./user.service";

const MLE_ORGANIZATION_ID = 2;

@Resolver(() => User)
export class UserResolver {
    private readonly logger = new Logger(UserResolver.name);

    constructor(
        private readonly identityService: IdentityService,
        private readonly userService: UserService,
        private readonly memberService: MemberService,
        private readonly playerService: PlayerService,
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
    
    @Mutation(() => [User])
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async intakeUser(
        @Args("name", {type: () => String}) name: string,
        @Args("discord_id", {type: () => String}) d_id: string,
        @Args("playersToLink", {type: () => [CreatePlayerTuple]}) ptl: CreatePlayerTuple[],
        @Args("platformAccounts", {type: () => [IntakePlayerAccount] }) platformAccounts: IntakePlayerAccount[] = [],
    ): Promise<User> {
        // This looks a little backwards, but the identity service actually
        // creates the user object *and* the associated auth account for login
        // at the same time.
        const user = await this.identityService.registerUser(UserAuthenticationAccountType.DISCORD, d_id);
        
        // Once we have the user, we can create the member as part of MLE
        const member = await this.memberService.createMember(
            {name: name},
            MLE_ORGANIZATION_ID,
            user.id,
        );
        
        // For each game this user is going to participate in, create
        // the corresponding player
        let pid: number = 0;
        let sal: number = 0;
        for (const pt of ptl) {
            const player = await this.playerService.createPlayer(member.id, pt.gameSkillGroupId, pt.salary);
            pid = player.id;
            sal = pt.salary;
        }
        
        // Finally, create the corresponding MLE Player object
        await this.playerService.mle_createPlayer(
            pid,
            d_id,
            name,
            sal,
            platformAccounts,
        );

        // Send the newly created user back to the caller
        return user;
    }
}
