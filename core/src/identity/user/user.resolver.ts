import {
    Args, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {UserAuthenticationAccount} from "../../database";
import {User, UserAuthenticationAccountType} from "../../database";
import {IdentityService} from "../identity.service";

@Resolver(() => User)
export class UserResolver {
    constructor(private readonly identityService: IdentityService) {}

    @Mutation(() => User)
    async registerUser(
        @Args("accountId") accountId: string,
        @Args("accountType", {type: () => UserAuthenticationAccountType}) accountType: UserAuthenticationAccountType,
    ): Promise<User> {
        return this.identityService.registerUser(accountType, accountId);
    }

    @Query(() => User, {nullable: true})
    async getUserByAuthAccount(
        @Args("accountId") accountId: string,
        @Args("accountType", {type: () => UserAuthenticationAccountType}) accountType: UserAuthenticationAccountType,
    ): Promise<User | null> {
        return this.identityService.getUserByAuthAccount(accountType, accountId);
    }

    @ResolveField()
    async authenticationAccounts(@Root() user: User): Promise<UserAuthenticationAccount[]> {
        if (!Array.isArray(user.authenticationAccounts)) {
            return this.identityService.getAuthAccountsForUser(user.id);
        }
        return user.authenticationAccounts;
    }
}
