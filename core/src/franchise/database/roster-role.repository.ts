import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {RosterRole} from "./roster-role.entity";

@Injectable()
export class RosterRoleRepository extends ExtendedRepository<RosterRole> {
    constructor(readonly dataSource: DataSource) {
        super(RosterRole, dataSource);
    }
}
