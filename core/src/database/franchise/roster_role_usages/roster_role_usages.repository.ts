import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {RosterRoleUsage} from "./roster_role_usages.model";

@Injectable()
export class RosterRoleUsageRepository extends ExtendedRepository<RosterRoleUsage> {
    constructor(readonly dataSource: DataSource) {
        super(RosterRoleUsage, dataSource);
    }
}
