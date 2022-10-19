import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseLeadershipSeat} from "./franchise_leadership_seat.model";

@Injectable()
export class FranchiseLeadershipSeatRepository extends ExtendedRepository<FranchiseLeadershipSeat> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseLeadershipSeat, dataSource);
    }
}
