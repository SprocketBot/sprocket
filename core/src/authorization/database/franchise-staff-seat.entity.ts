import {Entity, ManyToOne, OneToMany} from "typeorm";

import {FranchiseStaffAppointment} from "";
import {FranchiseStaffRole} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class FranchiseStaffSeat extends BaseEntity {
    @ManyToOne(() => FranchiseStaffRole)
    role: FranchiseStaffRole;

    @OneToMany(() => FranchiseStaffAppointment, fsa => fsa.seat)
    appointments: FranchiseStaffAppointment[];
}
