import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {User} from "../../database";
import {UserAuthenticationAccount} from "../../database";
import {IdentityService} from "../identity.service";

@Resolver(() => UserAuthenticationAccount)
export class UserAuthenticationAccountResolver {
    constructor(private readonly identityService: IdentityService) {}

    @ResolveField()
    async user(@Root() authenticationAccount: Partial<UserAuthenticationAccount>): Promise<User> {
        return (
            authenticationAccount.user ??
            (await this.identityService.getUserByAuthAccount(
                authenticationAccount.accountType!,
                authenticationAccount.accountId!,
            ))
        );
    }
}
