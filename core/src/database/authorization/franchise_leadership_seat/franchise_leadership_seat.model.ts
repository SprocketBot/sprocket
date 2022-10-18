import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne, OneToMany} from "typeorm";

import {BaseModel} from "../../base-model";
import {FranchiseLeadershipAppointment} from "../../franchise/franchise_leadership_appointment";
import {FranchiseLeadershipRole} from "../franchise_leadership_role/franchise_leadership_role.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseLeadershipSeat extends BaseModel {
    @ManyToOne(() => FranchiseLeadershipRole)
    @Field(() => FranchiseLeadershipRole)
    role: FranchiseLeadershipRole;

    @OneToMany(() => FranchiseLeadershipAppointment, fla => fla.seat)
    @Field(() => [FranchiseLeadershipAppointment])
    appointments: FranchiseLeadershipAppointment[];
}
