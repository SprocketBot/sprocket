import {Column, Entity, ManyToOne} from "typeorm";

import {Organization} from "../../organization/database/organization.entity";
import {BaseEntity} from "../../types/base-entity";
import {OrganizationConfigurationKey} from "./organization-configuration-key.entity";

@Entity({schema: "sprocket"})
export class OrganizationConfigurationValue extends BaseEntity {
    @Column()
    value: string;

    @ManyToOne(() => Organization)
    organization: Organization;

    @ManyToOne(() => OrganizationConfigurationKey)
    key: OrganizationConfigurationKey;
}
