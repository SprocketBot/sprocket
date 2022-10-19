import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {OrganizationStaffPosition} from "./organization_staff_position.model";

@Injectable()
export class OrganizationStaffPositionRepository extends ExtendedRepository<OrganizationStaffPosition> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationStaffPosition, dataSource);
    }
}
