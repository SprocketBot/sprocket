import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {User} from "$db/identity/user/user.model";
import {UserAuthenticationAccount} from "$db/identity/user_authentication_account/user_authentication_account.model";
import type {UserAuthenticationAccountType as AccountType} from "$db/identity/user_authentication_account/user_authentication_account_type.enum";

@Injectable()
export class IdentityService {
    constructor(
        @InjectRepository(UserAuthenticationAccount) private userAuthAccountRepository: Repository<UserAuthenticationAccount>,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) {
    }

    /**
     *  Registers a user with sprocket; given the account information for their first authentication account.
     */
    async registerUser(accountType: AccountType, accountId: string): Promise<User> {
        const user = this.userRepository.create({});
        await this.userRepository.save(user);
        const userAuthenticationAccount = this.userAuthAccountRepository.create({
            accountType,
            accountId,
            user,
        });
        await this.userAuthAccountRepository.save(userAuthenticationAccount);
        return user;
    }

    /**
     * Looks up a sprocket user by a given account type and id
     * @throws When a matching user is not found
     */
    async getUserByAuthAccount(accountType: AccountType, accountId: string): Promise<User> {
        return this.userRepository.createQueryBuilder("user")
            .leftJoin("user.authenticationAccounts", "authAccounts")
            .where("authAccounts.accountId = :aId", {aId: accountId})
            .andWhere("authAccounts.accountType = :aType", {aType: accountType})
            .getOneOrFail();
    }
    
    async getAuthAccountsForUser(userId: number): Promise<UserAuthenticationAccount[]> {
        return this.userAuthAccountRepository.find({
            where: {
                user: {
                    id: userId,
                },
            },
        });
    }
}
