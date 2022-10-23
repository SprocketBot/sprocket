import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories";
import {MemberProfile} from "./member_profile.model";

@Injectable()
export class MemberProfileRepository extends ExtendedRepository<MemberProfile> {
    constructor(readonly dataSource: DataSource) {
        super(MemberProfile, dataSource);
    }
}
