import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {OrganizationStaffSeat} from "./organization_staff_seat.model";

@Injectable()
export class OrganizationStaffSeatRepository extends ExtendedRepository<OrganizationStaffSeat> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationStaffSeat, dataSource);
    }
}
