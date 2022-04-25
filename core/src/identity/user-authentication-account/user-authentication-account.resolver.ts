import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {User} from "../../database";
import {UserAuthenticationAccount} from "../../database";
import {IdentityService} from "../identity.service";

@Resolver(() => UserAuthenticationAccount)
export class UserAuthenticationAccountResolver {
    constructor(private readonly identityService: IdentityService) {}

    @ResolveField()
    async user(@Root() acct: UserAuthenticationAccount): Promise<User> {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (acct.user) {
            return acct.user;
        }

        return this.identityService.getUserByAuthAccount(acct.accountType, acct.accountId);
    }
}
