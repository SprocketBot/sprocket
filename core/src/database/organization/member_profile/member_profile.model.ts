import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Member} from "../member/member.model";
import {Photo} from "../photo/photo.model";
import {Pronouns} from "../pronouns/pronouns.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class MemberProfile extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @ManyToOne(() => Pronouns, {nullable: true})
    @JoinColumn()
    @Field(() => Pronouns, {nullable: true})
    pronouns?: Pronouns;

    @OneToOne(() => Photo, {nullable: true})
    @JoinColumn()
    @Field(() => Photo, {nullable: true})
    profilePicture?: Photo;

    @OneToOne(() => Member)
    @JoinColumn()
    @Field(() => Member)
    member: Member;
}
