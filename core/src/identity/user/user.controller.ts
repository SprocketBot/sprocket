import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {CoreOutput} from "@sprocketbot/common";
import {
    CoreEndpoint, CoreSchemas,
} from "@sprocketbot/common";

import {UserAuthenticationAccountType} from "../../database";
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

    @MessagePattern(CoreEndpoint.GetUserByDiscordId)
    async getUserByDiscordId(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetUserByDiscordId>> {
        const data = CoreSchemas.GetUserByDiscordId.input.parse(payload);
        const user = await this.userService.getUserByDiscordId(data.discordId);
        return {id: user.id};
    }
}
