import {Entity, ManyToOne} from "typeorm";

import {FranchiseStaffSeat} from "../../authorization/database/franchise-staff-seat.entity";
import {Member} from "../../organization/database/member.entity";
import {BaseEntity} from "../../types/base-entity";
import {Franchise} from "./franchise.entity";

@Entity({schema: "sprocket"})
export class FranchiseStaffAppointment extends BaseEntity {
    @ManyToOne(() => Franchise)
    franchise: Franchise;

    @ManyToOne(() => Member)
    member: Member;

    @ManyToOne(() => FranchiseStaffSeat)
    seat: FranchiseStaffSeat;
}
