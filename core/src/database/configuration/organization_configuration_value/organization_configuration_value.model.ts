import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../../organization/organization";
import {OrganizationConfigurationKey} from "../organization_configuration_key";

@Entity({schema: "sprocket"})
@ObjectType()
export class OrganizationConfigurationValue extends BaseModel {
    @Column()
    @Field(() => String)
    value: string;

    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;

    @ManyToOne(() => OrganizationConfigurationKey)
    @Field(() => OrganizationConfigurationKey)
    key: OrganizationConfigurationKey;
}
