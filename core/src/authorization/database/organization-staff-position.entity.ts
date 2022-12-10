import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {OrganizationStaffRole} from "";
import {OrganizationStaffTeam} from "";
import {PermissionBearer} from "";

import {BaseEntity} from "../../types/base-entity";

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
