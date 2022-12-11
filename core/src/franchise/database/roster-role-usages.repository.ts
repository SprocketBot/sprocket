import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {RosterRoleUsage} from "./roster-role-usages.entity";

@Injectable()
export class RosterRoleUsageRepository extends ExtendedRepository<RosterRoleUsage> {
    constructor(readonly dataSource: DataSource) {
        super(RosterRoleUsage, dataSource);
    }
}
