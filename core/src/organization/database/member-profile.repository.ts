import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {MemberProfile} from "./member-profile.entity";

@Injectable()
export class MemberProfileRepository extends ExtendedRepository<MemberProfile> {
    constructor(readonly dataSource: DataSource) {
        super(MemberProfile, dataSource);
    }
}
