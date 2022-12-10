import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {Organization} from "";
import {PermissionBearer} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class OrganizationStaffTeam extends BaseEntity {
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
