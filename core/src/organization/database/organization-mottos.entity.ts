import {Column, Entity, ManyToOne} from "typeorm";

import {Organization} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class OrganizationMottos extends BaseEntity {
    @ManyToOne(() => Organization)
    organization: Organization;

    @Column()
    motto: string;
}
