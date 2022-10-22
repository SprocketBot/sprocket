import {Injectable} from "@nestjs/common";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import type {User} from "../models";
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

    async getUserByAuthAccount(
        type: UserAuthenticationAccountType,
        accountId: string,
        options?: FindOneOptions<UserAuthenticationAccount>,
    ): Promise<User> {
        const account = await this.findOneOrFail(
            Object.assign(
                {
                    where: {
                        accountType: type,
                        accountId: accountId,
                    },
                    relations: {
                        user: true,
                    },
                },
                options,
            ),
        );

        return account.user;
    }

    async getAuthAccount(
        type: UserAuthenticationAccountType,
        accountId: string,
        options?: FindOneOptions<UserAuthenticationAccount>,
    ): Promise<UserAuthenticationAccount | null> {
        return this.findOne(
            Object.assign(
                {
                    where: {
                        accountType: type,
                        accountId: accountId,
                    },
                    relations: {
                        user: true,
                    },
                },
                options,
            ),
        );
    }
}
