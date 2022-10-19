import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {RosterRoleUseLimits} from "./roster_role_use_limits.model";

@Injectable()
export class RosterRoleUseLimitsRepository extends ExtendedRepository<RosterRoleUseLimits> {
    constructor(readonly dataSource: DataSource) {
        super(RosterRoleUseLimits, dataSource);
    }
}
