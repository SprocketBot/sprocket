import {UseGuards} from "@nestjs/common";
import {Args, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {Member, UserAuthenticationAccount, UserProfile} from "$models";
import {User} from "$models";
import {UserRepository} from "$repositories";

import {PopulateService} from "../../util/populate/populate.service";
import {UserPayload} from "../auth";
import {CurrentUser} from "../auth/current-user.decorator";
import {GqlJwtGuard} from "../auth/gql-auth-guard";

@Resolver(() => User)
export class UserResolver {
    constructor(private readonly userRepository: UserRepository, private readonly populateService: PopulateService) {}

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
}
