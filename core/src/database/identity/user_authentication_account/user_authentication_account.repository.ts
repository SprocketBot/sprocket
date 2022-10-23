import {Injectable} from "@nestjs/common";
import type {FindManyOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {UserAuthenticationAccount} from "./user_authentication_account.model";
import {UserAuthenticationAccountType} from "./user_authentication_account_type.enum";

@Injectable()
export class UserAuthenticationAccountRepository extends ExtendedRepository<UserAuthenticationAccount> {
    constructor(readonly dataSource: DataSource) {
        super(UserAuthenticationAccount, dataSource);
    }

    async getDiscordAccountByUserId(userId: number): Promise<UserAuthenticationAccount> {
        return this.findOneOrFail({where: {userId: userId, accountType: UserAuthenticationAccountType.DISCORD}});
    }

    async getByUserId(
        userId: number,
        options?: FindManyOptions<UserAuthenticationAccount>,
    ): Promise<UserAuthenticationAccount[]> {
        return this.find(Object.assign({where: {userId}}, options));
    }
}
