import {Entity, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {Organization} from "../../organization/database/organization.entity";
import {BaseEntity} from "../../types/base-entity";
import {FranchiseGroupAssignment} from "./franchise-group-assignment.entity";
import {FranchiseLeadershipAppointment} from "./franchise-leadership-appointment.entity";
import {FranchiseProfile} from "./franchise-profile.entity";
import {FranchiseStaffAppointment} from "./franchise-staff-appointment.entity";

@Entity({schema: "sprocket"})
export class Franchise extends BaseEntity {
    @OneToOne(() => FranchiseProfile, p => p.franchise)
    profile: FranchiseProfile;

    @OneToMany(() => FranchiseGroupAssignment, fga => fga.franchise)
    groupAssignments: FranchiseGroupAssignment[];

    @OneToMany(() => FranchiseStaffAppointment, fsa => fsa.franchise)
    staffAppointments: FranchiseStaffAppointment[];

    @OneToMany(() => FranchiseLeadershipAppointment, fla => fla.franchise)
    leadershipAppointments: FranchiseLeadershipAppointment[];

    @ManyToOne(() => Organization)
    organization: Organization;
}
