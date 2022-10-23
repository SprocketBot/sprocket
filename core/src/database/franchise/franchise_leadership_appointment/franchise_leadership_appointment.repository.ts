import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseLeadershipAppointment} from "./franchise_leadership_appointment.model";

@Injectable()
export class FranchiseLeadershipAppointmentRepository extends ExtendedRepository<FranchiseLeadershipAppointment> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseLeadershipAppointment, dataSource);
    }
}
