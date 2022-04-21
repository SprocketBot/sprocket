import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Platform} from "../../game/platform";
import {Member} from "../member";
@Entity()
@ObjectType()
export class MemberPlatformAccount extends BaseModel {
    @ManyToOne(() => Member)
    @Field(() => Member)
    member: Member;

    @ManyToOne(() => Platform)
    @Field(() => Platform)
    platform: Platform;

    @Column()
    @Field(() => String)
    platformAccountId: string;
}
