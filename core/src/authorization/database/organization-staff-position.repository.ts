import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {OrganizationStaffPosition} from "./organization-staff-position.entity";

@Injectable()
export class OrganizationStaffPositionRepository extends ExtendedRepository<OrganizationStaffPosition> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationStaffPosition, dataSource);
    }
}
