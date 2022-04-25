import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {OrganizationConfigurationKey} from "../organization_configuration_key";
@Entity()
@ObjectType()
export class OrganizationConfigurationAllowedValue extends BaseModel {
    @Column()
    @Field(() => String)
    value: string;

    @ManyToOne(() => OrganizationConfigurationKey)
    @Field(() => OrganizationConfigurationKey)
    key: OrganizationConfigurationKey;

    @Column()
    @Field(() => Boolean)
    /**
     * Indicates if the value is a regex or literal
     */
    pattern: boolean;
}
