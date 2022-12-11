import {Entity, ManyToOne, OneToMany} from "typeorm";

import {FranchiseLeadershipAppointment} from "../../franchise/database/franchise-leadership-appointment.entity";
import {BaseEntity} from "../../types/base-entity";
import {FranchiseLeadershipRole} from "./franchise-leadership-role.entity";

@Entity({schema: "sprocket"})
export class FranchiseLeadershipSeat extends BaseEntity {
    @ManyToOne(() => FranchiseLeadershipRole)
    role: FranchiseLeadershipRole;

    @OneToMany(() => FranchiseLeadershipAppointment, fla => fla.seat)
    appointments: FranchiseLeadershipAppointment[];
}
