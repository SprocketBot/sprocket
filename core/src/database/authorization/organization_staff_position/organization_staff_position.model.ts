import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {OrganizationStaffRole} from "../organization_staff_role/organization_staff_role.model";
import {OrganizationStaffTeam} from "../organization_staff_team/organization_staff_team.model";
import {PermissionBearer} from "../permission_bearer/permission_bearer.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class OrganizationStaffPosition extends BaseModel {
    @ManyToOne(() => OrganizationStaffRole)
    @Field(() => OrganizationStaffRole)
    role: OrganizationStaffRole;

    @ManyToOne(() => OrganizationStaffTeam)
    @Field(() => OrganizationStaffTeam)
    team: OrganizationStaffTeam;

    @OneToOne(() => PermissionBearer)
    @JoinColumn()
    @Field(() => PermissionBearer)
    bearer: PermissionBearer;
}
