import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {OrganizationStaffRole} from "./organization-staff-role.entity";
import {OrganizationStaffTeam} from "./organization-staff-team.entity";
import {PermissionBearer} from "./permission-bearer.entity";

@Entity({schema: "sprocket"})
export class OrganizationStaffPosition extends BaseEntity {
    @ManyToOne(() => OrganizationStaffRole)
    role: OrganizationStaffRole;

    @ManyToOne(() => OrganizationStaffTeam)
    team: OrganizationStaffTeam;

    @OneToOne(() => PermissionBearer)
    @JoinColumn()
    bearer: PermissionBearer;
}
