import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Member} from "../member";
import {Photo} from "../photo";
import {Pronouns} from "../pronouns";

@Entity({schema: "sprocket"})
@ObjectType()
export class MemberProfile extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @ManyToMany(() => Pronouns, {nullable: true})
    @JoinTable()
    @Field(() => Pronouns, {nullable: true})
    pronouns?: Pronouns;

    @OneToOne(() => Photo, {nullable: true})
    @JoinColumn()
    @Field(() => Photo, {nullable: true})
    profilePicture?: Photo;

    @OneToOne(() => Member)
    @Field(() => Member)
    member: Member;
}
