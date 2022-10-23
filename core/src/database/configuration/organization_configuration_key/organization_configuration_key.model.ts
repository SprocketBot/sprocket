import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, OneToMany} from "typeorm";

import {BaseModel} from "../../base-model";
import {OrganizationConfigurationAllowedValue} from "../organization_configuration_allowed_value/organization_configuration_allowed_value.model";
import {
    OrganizationConfigurationKeyCode,
    OrganizationConfigurationKeyType,
} from "./organization_configuration_key.enum";

@Entity({schema: "sprocket"})
@ObjectType()
export class OrganizationConfigurationKey extends BaseModel {
    @Column({type: "enum", enum: OrganizationConfigurationKeyCode})
    @Field(() => OrganizationConfigurationKeyCode)
    code: OrganizationConfigurationKeyCode;

    @Column()
    @Field(() => String)
    default: string;

    @OneToMany(() => OrganizationConfigurationAllowedValue, ocav => ocav.key)
    @Field(() => [OrganizationConfigurationAllowedValue])
    allowedValues: OrganizationConfigurationAllowedValue[];

    @Column({
        type: "enum",
        enum: OrganizationConfigurationKeyType,
    })
    @Field(() => OrganizationConfigurationKeyType)
    type: OrganizationConfigurationKeyType;
}
