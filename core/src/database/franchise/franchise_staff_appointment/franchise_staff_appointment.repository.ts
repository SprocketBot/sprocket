import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseStaffAppointment} from "./franchise_staff_appointment.model";

@Injectable()
export class FranchiseStaffAppointmentRepository extends ExtendedRepository<FranchiseStaffAppointment> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseStaffAppointment, dataSource);
    }
}
