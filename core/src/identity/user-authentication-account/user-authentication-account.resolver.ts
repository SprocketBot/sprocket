import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {User} from "$models";
import {UserAuthenticationAccount} from "$models";
import {PopulateService} from "$util";

@Resolver(() => UserAuthenticationAccount)
export class UserAuthenticationAccountResolver {
    constructor(private readonly populateService: PopulateService) {}

    @ResolveField()
    async user(@Root() authenticationAccount: Partial<UserAuthenticationAccount>): Promise<User> {
        return (
            authenticationAccount.user ??
            (await this.populateService.populateOneOrFail(
                UserAuthenticationAccount,
                authenticationAccount as UserAuthenticationAccount,
                "user",
            ))
        );
    }
}
