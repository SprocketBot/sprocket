import {Entity, ManyToOne} from "typeorm";

import {FranchiseLeadershipSeat} from "../../authorization/database/franchise-leadership-seat.entity";
import {Member} from "../../organization/database/member.entity";
import {BaseEntity} from "../../types/base-entity";
import {Franchise} from "./franchise.entity";

@Entity({schema: "sprocket"})
export class FranchiseLeadershipAppointment extends BaseEntity {
    @ManyToOne(() => Franchise)
    franchise: Franchise;

    @ManyToOne(() => Member)
    member: Member;

    @ManyToOne(() => FranchiseLeadershipSeat)
    seat: FranchiseLeadershipSeat;
}
