import {Query, Resolver} from "@nestjs/graphql";

import {AuthorizationService} from "./authorization.service";
import {Actions} from "./decorators/actions.decorator";

@Resolver()
export class AuthorizationResolver {
    constructor(private readonly authorizationService: AuthorizationService) {}

    @Query(() => [String])
    async testAuth(): Promise<string[]> {
        return this.authorizationService.getMemberActions(2692);
    }

    @Query(() => String)
    @Actions("Scrim.CancelScrim")
    async test(): Promise<string> {
        return "hello";
    }
}
