import { ObjectType, Field } from "@nestjs/graphql";
import { FranchiseGroupAssignment } from "../database/franchise-group-assignment.entity";
import { FranchiseLeadershipAppointment } from "../database/franchise-leadership-appointment.entity";
import { FranchiseStaffAppointment } from "../database/franchise-staff-appointment.entity";
import { Organization } from "../../organization/database/organization.entity";
import { FranchiseProfileObject } from "./franchise-profile.object";

@ObjectType()
export class FranchiseObject {
    @Field(() => FranchiseProfileObject)
    profile: FranchiseProfileObject;

    groupAssignments: FranchiseGroupAssignment[];
    staffAppointments: FranchiseStaffAppointment[];
    leadershipAppointments: FranchiseLeadershipAppointment[];
    organization: Organization;
}