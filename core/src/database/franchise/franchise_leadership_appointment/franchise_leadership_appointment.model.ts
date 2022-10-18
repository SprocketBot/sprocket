import {Field, ObjectType} from "@nestjs/graphql/dist/decorators";
import {Entity, ManyToOne} from "typeorm";

import {FranchiseLeadershipSeat} from "../../authorization/models";
import {BaseModel} from "../../base-model";
import {Member} from "../../organization/models";
import {Franchise} from "../franchise";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseLeadershipAppointment extends BaseModel {
    @ManyToOne(() => Franchise)
    @Field(() => Franchise)
    franchise: Franchise;

    @ManyToOne(() => Member)
    @Field(() => Member)
    member: Member;

    @ManyToOne(() => FranchiseLeadershipSeat)
    @Field(() => FranchiseLeadershipSeat)
    seat: FranchiseLeadershipSeat;
}
