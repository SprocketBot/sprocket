import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseStaffSeat} from "./franchise-staff-seat.entity";

@Injectable()
export class FranchiseStaffSeatRepository extends ExtendedRepository<FranchiseStaffSeat> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseStaffSeat, dataSource);
    }
}
