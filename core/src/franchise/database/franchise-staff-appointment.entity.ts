import {Entity, ManyToOne} from "typeorm";

import {FranchiseStaffSeat} from "";
import {Member} from "";
import {Franchise} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class FranchiseStaffAppointment extends BaseEntity {
    @ManyToOne(() => Franchise)
    franchise: Franchise;

    @ManyToOne(() => Member)
    member: Member;

    @ManyToOne(() => FranchiseStaffSeat)
    seat: FranchiseStaffSeat;
}
