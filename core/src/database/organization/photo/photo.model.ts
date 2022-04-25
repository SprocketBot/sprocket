import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Approval} from "../approval";
@Entity()
@ObjectType()
export class Photo extends BaseModel {
    @Column({nullable: true})
    @Field(() => String, {nullable: true})
    url?: string;

    @OneToOne(() => Approval)
    @JoinColumn()
    @Field(() => Approval)
    approval: Approval;
}
