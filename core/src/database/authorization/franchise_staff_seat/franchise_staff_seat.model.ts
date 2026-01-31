import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, ManyToOne, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {FranchiseStaffAppointment} from "../../franchise/franchise_staff_appointment";
import {FranchiseStaffRole} from "../franchise_staff_role";

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
