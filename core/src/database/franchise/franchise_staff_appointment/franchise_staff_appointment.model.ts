import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {FranchiseStaffSeat} from "../../authorization/models";
import {BaseModel} from "../../base-model";
import {Member} from "../../organization/models";
import {Franchise} from "../franchise";

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
