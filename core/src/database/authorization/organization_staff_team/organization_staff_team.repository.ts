import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {OrganizationStaffTeam} from "./organization_staff_team.model";

@Injectable()
export class OrganizationStaffTeamRepository extends ExtendedRepository<OrganizationStaffTeam> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationStaffTeam, dataSource);
    }
}
