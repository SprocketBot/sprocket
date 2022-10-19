import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {RosterRole} from "./roster_role.model";

@Injectable()
export class RosterRoleRepository extends ExtendedRepository<RosterRole> {
    constructor(readonly dataSource: DataSource) {
        super(RosterRole, dataSource);
    }
}
