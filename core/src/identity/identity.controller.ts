import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {GetUserByAuthAccountResponse} from "@sprocketbot/common";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {UserAuthenticationAccountRepository} from "./database/user-authentication-account.repository";
import type {UserAuthenticationAccountType} from "./database/user-authentication-account-type.enum";
import {UserProfileRepository} from "./database/user-profile.repository";

@Controller("identity")
export class IdentityController {
    constructor(
        private readonly userProfileRepository: UserProfileRepository,
        private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository,
    ) {}

    @MessagePattern(CoreEndpoint.GetUserByAuthAccount)
    async getUserByAuthAccount(@Payload() payload: unknown): Promise<GetUserByAuthAccountResponse> {
        const data = CoreSchemas.GetUserByAuthAccount.input.parse(payload);
        const acc = await this.userAuthenticationAccountRepository.findOneOrFail({
            where: {
                accountType: data.accountType as UserAuthenticationAccountType,
                accountId: data.accountId,
            },
        });
        const user = acc.user;
        const profile = await this.userProfileRepository.getByUserId(user.id);
        return {
            id: user.id,
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
