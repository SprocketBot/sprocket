import {Column, Entity, ManyToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Organization} from "./organization.entity";

@Entity({schema: "sprocket"})
export class OrganizationMottos extends BaseEntity {
    @ManyToOne(() => Organization)
    organization: Organization;

    @Column()
    motto: string;
}
