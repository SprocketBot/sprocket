import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {Organization} from "../../organization/database/organization.entity";
import {BaseEntity} from "../../types/base-entity";
import {PermissionBearer} from "./permission-bearer.entity";

@Entity({schema: "sprocket"})
export class OrganizationStaffRole extends BaseEntity {
    @Column()
    name: string;

    @Column()
    ordinal: number;

    @ManyToOne(() => PermissionBearer)
    @JoinColumn()
    bearer: PermissionBearer;

    @ManyToOne(() => Organization)
    @JoinColumn()
    organization: Organization;

    @Column()
    organizationId: number;
}
