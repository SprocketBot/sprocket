import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne, Unique,
} from "typeorm";

import {VerbiageCode} from "$db/configuration/verbiage_code/verbiage_code.model";

import {BaseModel} from "../../base-model";
import {Organization} from "../../organization/organization/organization.model";

@Entity({schema: "sprocket"})
@Unique(["organization", "code"])
@ObjectType()
export class Verbiage extends BaseModel {
    @Column()
    @Field(() => String)
    term: string;

    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;

    @ManyToOne(() => VerbiageCode)
    @Field(() => VerbiageCode)
    code: VerbiageCode;
}
