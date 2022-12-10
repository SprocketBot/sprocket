import {Column, Entity, OneToMany} from "typeorm";

import {OrganizationConfigurationAllowedValue} from "";
import {OrganizationConfigurationKeyCode, OrganizationConfigurationKeyType} from "";

import {BaseEntity} from "../../types/base-entity";

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