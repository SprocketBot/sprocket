import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {User} from "../../database";
import type { UserAuthenticationAccount } from "../../database/identity/user_authentication_account/user_authentication_account.model";
import {IdentityService} from "../identity.service";

@Resolver(() => UserAuthenticationAccount)
export class UserAuthenticationAccountResolver {
    constructor(private readonly identityService: IdentityService) {}

    @ResolveField()
    async user(@Root() authenticationAccount: Partial<UserAuthenticationAccount>): Promise<User> {
        return authenticationAccount.user ?? await this.identityService.getUserByAuthAccount(authenticationAccount.accountType!, authenticationAccount.accountId!);
    }
}
