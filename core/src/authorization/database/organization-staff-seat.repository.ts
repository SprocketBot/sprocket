import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {OrganizationStaffSeat} from "./organization-staff-seat.entity";

@Injectable()
export class OrganizationStaffSeatRepository extends ExtendedRepository<OrganizationStaffSeat> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationStaffSeat, dataSource);
    }
}
