import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Member} from "../member";
@Entity({ schema: "sprocket" })
@ObjectType()
export class Approval extends BaseModel {
    @Column()
    @Field(() => String)
    notes: string;

    @Column({default: false})
    @Field(() => Boolean, {defaultValue: false})
    isApproved: boolean;

    @ManyToOne(() => Member, {nullable: true})
    @Field(() => Member, {nullable: true})
    approvedBy?: Member;
}
