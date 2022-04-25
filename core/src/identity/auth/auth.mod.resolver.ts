import {UseGuards} from "@nestjs/common";
import {
    Args, Mutation, Query, Resolver,
} from "@nestjs/graphql";

import {AnonymousAuthService} from "./anonymous-auth/anonymous-auth.service";
import {CurrentUser} from "./current-user.decorator";
import {GqlJwtGuard} from "./gql-auth-guard/gql-jwt-guard";
import {UserPayload} from "./oauth/types/userpayload.type";

@Resolver()
export class AuthModuleResolver {
    constructor(private readonly anonAuthService: AnonymousAuthService) {}

    @Query(() => String)
    @UseGuards(GqlJwtGuard)
    me(@CurrentUser() cu: UserPayload): string {
        return cu.userId.toString();
    }

    @Mutation(() => String, {description: "Used for development, this provides a bare minimum JWT based on an arbitrary username input"})
    anonymousLogin(@Args("username") username: string): string {
        return this.anonAuthService.generateAnonymousJwt(username);
    }
}
