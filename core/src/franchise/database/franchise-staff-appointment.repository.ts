import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseStaffAppointment} from "./franchise-staff-appointment.entity";

@Injectable()
export class FranchiseStaffAppointmentRepository extends ExtendedRepository<FranchiseStaffAppointment> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseStaffAppointment, dataSource);
    }
}
