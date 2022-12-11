import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseLeadershipSeat} from "./franchise-leadership-seat.entity";

@Injectable()
export class FranchiseLeadershipSeatRepository extends ExtendedRepository<FranchiseLeadershipSeat> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseLeadershipSeat, dataSource);
    }
}
