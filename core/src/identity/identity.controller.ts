import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {GetUserByAuthAccountResponse} from "@sprocketbot/common";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {UserAuthenticationAccountType} from "../database";
import {IdentityService} from "./identity.service";
import {UserService} from "./user";

@Controller("identity")
export class IdentityController {
    constructor(
        private readonly identityService: IdentityService,
        private readonly userService: UserService,
    ) {
    }

    @MessagePattern(CoreEndpoint.GetUserByAuthAccount)
    async getUserByAuthAccount(@Payload() payload: unknown): Promise<GetUserByAuthAccountResponse> {
        const data = CoreSchemas.GetUserByAuthAccount.input.parse(payload);
        const user = await this.identityService.getUserByAuthAccount(
            data.accountType as UserAuthenticationAccountType,
            data.accountId,
        );
        const profile = await this.userService.getUserProfileForUser(user.id);
        return {
            id: user.id,
            roles: user.type,
            profile: {
                email: profile.email,
                displayName: profile.displayName,
                firstName: profile.firstName,
                lastName: profile.lastName,
                description: profile.description,
            },
        };
    }
}
