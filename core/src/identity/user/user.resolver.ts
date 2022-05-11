import {UseGuards} from "@nestjs/common";
import {
    Args, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {UserAuthenticationAccount, UserProfile} from "../../database";
import {User, UserAuthenticationAccountType} from "../../database";
import {CurrentUser} from "../auth/current-user.decorator";
import {GqlJwtGuard} from "../auth/gql-auth-guard/gql-jwt-guard";
import {UserPayload} from "../auth/oauth/types/userpayload.type";
import {IdentityService} from "../identity.service";
import {UserService} from "./user.service";

@Resolver(() => User)
export class UserResolver {
    constructor(
        private readonly identityService: IdentityService,
        private readonly userService: UserService,
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
    async authenticationAccounts(@Root() user: User): Promise<UserAuthenticationAccount[]> {
        if (!Array.isArray(user.authenticationAccounts)) {
            return this.identityService.getAuthAccountsForUser(user.id);
        }
        return user.authenticationAccounts;
    }

    @ResolveField()
    async userProfile(@Root() user: Partial<User>): Promise<UserProfile> {
        return user.userProfile ?? await this.userService.getUserProfileForUser(user.id!);
    }
}
