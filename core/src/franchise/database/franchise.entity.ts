import {Entity, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {Organization} from "";
import {FranchiseGroupAssignment} from "";
import {FranchiseLeadershipAppointment} from "";
import {FranchiseProfile} from "";
import {FranchiseStaffAppointment} from "";

import {BaseEntity} from "../../types/base-entity";

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
