import {UseGuards} from "@nestjs/common";
import {Mutation, Resolver} from "@nestjs/graphql";

import {AuthenticationService} from "./authentication.service";
import {AuthenticatedUser} from "./decorators/authenticated-user.decorator";
import {GraphQLJwtRefreshGuard} from "./strategies/jwt/guards";
import {JwtRefreshPayload} from "./strategies/jwt/jwt.types";

@Resolver()
export class AuthenticationResolver {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @Mutation(() => String)
    @UseGuards(GraphQLJwtRefreshGuard)
    async refreshLogin(@AuthenticatedUser() user: JwtRefreshPayload): Promise<string> {
        return "not implemented";
    }
}
