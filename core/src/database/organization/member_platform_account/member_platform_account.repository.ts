import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories";
import {MemberPlatformAccount} from "./member_platform_account.model";

@Injectable()
export class MemberPlatformAccountRepository extends ExtendedRepository<MemberPlatformAccount> {
    constructor(readonly dataSource: DataSource) {
        super(MemberPlatformAccount, dataSource);
    }
}
