import {Column, Entity, OneToMany} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {OrganizationConfigurationAllowedValue} from "./organization-configuration-allowed-value.entity";
import {
    OrganizationConfigurationKeyCode,
    OrganizationConfigurationKeyType,
} from "./organization-configuration-key.enum";

@Entity({schema: "sprocket"})
export class OrganizationConfigurationKey extends BaseEntity {
    @Column({type: "enum", enum: OrganizationConfigurationKeyCode})
    code: OrganizationConfigurationKeyCode;

    @Column()
    default: string;

    @OneToMany(() => OrganizationConfigurationAllowedValue, ocav => ocav.key)
    allowedValues: OrganizationConfigurationAllowedValue[];

    @Column({
        type: "enum",
        enum: OrganizationConfigurationKeyType,
    })
    type: OrganizationConfigurationKeyType;
}
