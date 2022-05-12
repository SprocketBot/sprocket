import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {OrganizationConfigurationAllowedValue} from "../organization_configuration_allowed_value";

@Entity({schema: "sprocket"})
@ObjectType()
export class OrganizationConfigurationKey extends BaseModel {
    @Column()
    @Field(() => String)
    code: string;

    @Column()
    @Field(() => String)
    default: string;

    @OneToMany(() => OrganizationConfigurationAllowedValue, ocav => ocav.key)
    @Field(() => [OrganizationConfigurationAllowedValue])
    allowedValues: OrganizationConfigurationAllowedValue[];
}
