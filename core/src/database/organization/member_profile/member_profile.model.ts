import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, ManyToOne, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Member} from "../member";
import {Photo} from "../photo";
import {Pronouns} from "../pronouns";
@Entity()
@ObjectType()
export class MemberProfile extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @ManyToOne(() => Pronouns)
    @Field(() => Pronouns)
    pronouns: Pronouns;

    @OneToOne(() => Photo)
    @JoinColumn()
    @Field(() => Photo)
    profilePicture: Photo;

    @OneToOne(() => Member)
    @Field(() => Member)
    member: Member;
}
