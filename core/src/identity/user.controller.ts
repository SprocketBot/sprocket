import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {UserAuthenticationAccountRepository} from "./database/user-authentication-account.repository";

@Controller("user")
export class UserController {
    constructor(private readonly userAuthenitcationAccountRepository: UserAuthenticationAccountRepository) {}

    @MessagePattern(CoreEndpoint.GetDiscordIdByUser)
    async getDiscordIdByUser(@Payload() payload: unknown): Promise<string | undefined> {
        const data = CoreSchemas.GetDiscordIdByUser.input.parse(payload);
        const discordAccount = await this.userAuthenitcationAccountRepository.getDiscordAccountByUserId(data);

        return discordAccount.accountId;
    }
}
