import {Column, Entity, ManyToOne} from "typeorm";

import {Organization} from "";
import {OrganizationConfigurationKey} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class OrganizationConfigurationValue extends BaseEntity {
    @Column()
    value: string;

    @ManyToOne(() => Organization)
    organization: Organization;

    @ManyToOne(() => OrganizationConfigurationKey)
    key: OrganizationConfigurationKey;
}