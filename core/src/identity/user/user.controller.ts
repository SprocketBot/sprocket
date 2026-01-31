import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {UserAuthenticationAccountType} from "$db/identity/user_authentication_account/user_authentication_account_type.enum";

import {UserService} from "./user.service";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @MessagePattern(CoreEndpoint.GetDiscordIdByUser)
    async getDiscordIdByUser(@Payload() payload: unknown): Promise<string | undefined> {
        const data = CoreSchemas.GetDiscordIdByUser.input.parse(payload);
        const authenticationAccounts = await this.userService.getUserAuthenticationAccountsForUser(data);
        const discordAccount = authenticationAccounts.find(aa => aa.accountType === UserAuthenticationAccountType.DISCORD);

        return discordAccount?.accountId;
    }
}
