import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseLeadershipAppointment} from "./franchise-leadership-appointment.entity";

@Injectable()
export class FranchiseLeadershipAppointmentRepository extends ExtendedRepository<FranchiseLeadershipAppointment> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseLeadershipAppointment, dataSource);
    }
}
