import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, OneToOne,
} from "typeorm";

import {Approval} from "$db/organization/approval/approval.model";

import {BaseModel} from "../../base-model";

@Entity({schema: "sprocket"})
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
