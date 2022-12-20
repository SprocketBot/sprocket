import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {MemberPlatformAccount} from "./member-platform-account.entity";

@Injectable()
export class MemberPlatformAccountRepository extends ExtendedRepository<MemberPlatformAccount> {
    constructor(readonly dataSource: DataSource) {
        super(MemberPlatformAccount, dataSource);
    }
}
