import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne, Unique,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../../organization/organization";
import {VerbiageCode} from "../verbiage_code";

@Entity()
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
