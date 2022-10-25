import {UseGuards} from "@nestjs/common";
import {Mutation, Resolver} from "@nestjs/graphql";

import {AuthenticationService} from "./authentication.service";
import {GraphQLJwtRefreshGuard} from "./strategies/jwt/guards";

@Resolver()
export class AuthenticationResolver {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @Mutation(() => String)
    @UseGuards(GraphQLJwtRefreshGuard)
    async refreshLogin(): Promise<string> {
        return "not implemented";
    }
}
