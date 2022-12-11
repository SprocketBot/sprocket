import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {OrganizationStaffTeam} from "./organization-staff-team.entity";

@Injectable()
export class OrganizationStaffTeamRepository extends ExtendedRepository<OrganizationStaffTeam> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationStaffTeam, dataSource);
    }
}
