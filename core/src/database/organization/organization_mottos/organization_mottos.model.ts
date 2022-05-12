import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../organization";

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
