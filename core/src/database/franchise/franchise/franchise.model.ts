import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../../organization/models";
import {FranchiseGroupAssignment} from "../franchise_group_assignment/franchise_group_assignment.model";
import {FranchiseLeadershipAppointment} from "../franchise_leadership_appointment/franchise_leadership_appointment.model";
import {FranchiseProfile} from "../franchise_profile/franchise_profile.model";
import {FranchiseStaffAppointment} from "../franchise_staff_appointment/franchise_staff_appointment.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class Franchise extends BaseModel {
    @OneToOne(() => FranchiseProfile, p => p.franchise)
    @Field(() => FranchiseProfile)
    profile: FranchiseProfile;

    @OneToMany(() => FranchiseGroupAssignment, fga => fga.franchise)
    @Field(() => [FranchiseGroupAssignment])
    groupAssignments: FranchiseGroupAssignment[];

    @OneToMany(() => FranchiseStaffAppointment, fsa => fsa.franchise)
    @Field(() => [FranchiseStaffAppointment])
    staffAppointments: FranchiseStaffAppointment[];

    @OneToMany(() => FranchiseLeadershipAppointment, fla => fla.franchise)
    @Field(() => [FranchiseLeadershipAppointment])
    leadershipAppointments: FranchiseLeadershipAppointment[];

    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;
}
