import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {RosterRoleUseLimits} from "./roster-role-use-limits.entity";

@Injectable()
export class RosterRoleUseLimitsRepository extends ExtendedRepository<RosterRoleUseLimits> {
    constructor(readonly dataSource: DataSource) {
        super(RosterRoleUseLimits, dataSource);
    }
}
