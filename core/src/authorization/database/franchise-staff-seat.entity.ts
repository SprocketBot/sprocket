import {Entity, ManyToOne, OneToMany} from "typeorm";

import {FranchiseStaffAppointment} from "../../franchise/database/franchise-staff-appointment.entity";
import {BaseEntity} from "../../types/base-entity";
import {FranchiseStaffRole} from "./franchise-staff-role.entity";

@Entity({schema: "sprocket"})
export class FranchiseStaffSeat extends BaseEntity {
    @ManyToOne(() => FranchiseStaffRole)
    role: FranchiseStaffRole;

    @OneToMany(() => FranchiseStaffAppointment, fsa => fsa.seat)
    appointments: FranchiseStaffAppointment[];
}
