import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {Organization} from "$db/organization/organization/organization.model";

import {BaseModel} from "../../base-model";

@Entity({schema: "sprocket"})
@ObjectType()
export class OrganizationMottos extends BaseModel {
    @ManyToOne(() => Organization)
    @Field(() => Organization)
  organization: Organization;

    @Column()
    @Field(() => String)
  motto: string;
}
