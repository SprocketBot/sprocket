import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, ManyToOne, Unique,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Platform} from "../../game/platform";
import {Member} from "../member";

@Entity({schema: "sprocket"})
@ObjectType()
@Unique(["platform", "platformAccountId"])
export class MemberPlatformAccount extends BaseModel {
    @ManyToOne(() => Member)
    @JoinColumn()
    @Field(() => Member)
    member: Member;

    @ManyToOne(() => Platform)
    @JoinColumn()
    @Field(() => Platform)
    platform: Platform;

    @Column()
    @Field(() => String)
    platformAccountId: string;
}
