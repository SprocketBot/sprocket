import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne, OneToMany} from "typeorm";

import {BaseModel} from "../../base-model";
import {FranchiseStaffAppointment} from "../../franchise/models";
import {FranchiseStaffRole} from "../franchise_staff_role/franchise_staff_role.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseStaffSeat extends BaseModel {
    @ManyToOne(() => FranchiseStaffRole)
    @Field(() => FranchiseStaffRole)
    role: FranchiseStaffRole;

    @OneToMany(() => FranchiseStaffAppointment, fsa => fsa.seat)
    @Field(() => [FranchiseStaffAppointment])
    appointments: FranchiseStaffAppointment[];
}
