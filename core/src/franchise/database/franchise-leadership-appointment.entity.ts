import {Entity, ManyToOne} from "typeorm";

import {FranchiseLeadershipSeat} from "";
import {Member} from "";
import {Franchise} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class FranchiseLeadershipAppointment extends BaseEntity {
    @ManyToOne(() => Franchise)
    franchise: Franchise;

    @ManyToOne(() => Member)
    member: Member;

    @ManyToOne(() => FranchiseLeadershipSeat)
    seat: FranchiseLeadershipSeat;
}
