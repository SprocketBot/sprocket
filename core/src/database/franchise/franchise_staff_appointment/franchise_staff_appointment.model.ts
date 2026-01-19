import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {FranchiseStaffSeat} from "../../authorization/franchise_staff_seat";
import {BaseModel} from "../../base-model";
import {Member} from "../../organization/member";
import {Franchise} from "../franchise/franchise.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseStaffAppointment extends BaseModel {
    @ManyToOne(() => Franchise)
    @Field(() => Franchise)
    franchise: Franchise;

    @ManyToOne(() => Member)
    @Field(() => Member)
    member: Member;

    @ManyToOne(() => FranchiseStaffSeat)
    @Field(() => FranchiseStaffSeat)
    seat: FranchiseStaffSeat;
}
