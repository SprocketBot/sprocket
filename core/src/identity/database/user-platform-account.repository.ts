import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {UserPlatformAccount} from "./user-platform-account.entity";

@Injectable()
export class UserPlatformAccountRepository extends ExtendedRepository<UserPlatformAccount> {
    constructor(readonly dataSource: DataSource) {
        super(UserPlatformAccount, dataSource);
    }
}
