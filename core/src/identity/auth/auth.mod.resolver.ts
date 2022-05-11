import {
    Args, Mutation, Resolver,
} from "@nestjs/graphql";

import {AnonymousAuthService} from "./anonymous-auth/anonymous-auth.service";

@Resolver()
export class AuthModuleResolver {
    constructor(private readonly anonAuthService: AnonymousAuthService) {}

    @Mutation(() => String, {description: "Used for development, this provides a bare minimum JWT based on an arbitrary username input"})
    anonymousLogin(@Args("username") username: string): string {
        return this.anonAuthService.generateAnonymousJwt(username);
    }
}
