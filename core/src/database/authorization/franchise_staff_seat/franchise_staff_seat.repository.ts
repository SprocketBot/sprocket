import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseStaffSeat} from "./franchise_staff_seat.model";

@Injectable()
export class FranchiseStaffSeatRepository extends ExtendedRepository<FranchiseStaffSeat> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseStaffSeat, dataSource);
    }
}
