import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Photo} from "../../organization";
import {Franchise} from "../franchise";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseProfile extends BaseModel {
    @Column()
    @Field(() => String)
    title: string;

    @Column()
    @Field(() => String)
    code: string;

    @Column({nullable: true})
    @Field({nullable: true})
    scrimReportWebhookUrl?: string;

    @Column({nullable: true})
    @Field({nullable: true})
    matchReportWebhookUrl?: string;

    @OneToOne(() => Photo,  {nullable: true})
    @JoinColumn()
    @Field(() => Photo, {nullable: true})
    photo?: Photo;

    @OneToOne(() => Franchise)
    @JoinColumn()
    @Field(() => Franchise)
    franchise: Franchise;

    @Column()
    @Field()
    primaryColor: string;

    @Column()
    @Field()
    secondaryColor: string;

    @Column()
    @Field()
    alternateColor: string;
}
