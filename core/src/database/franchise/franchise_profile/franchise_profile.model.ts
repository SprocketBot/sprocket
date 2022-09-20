import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, ManyToOne, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Photo} from "../../organization";
import {Webhook} from "../../webhook";
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

    // Scrim Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    @Field(() => Webhook, {nullable: true})
    scrimReportCardWebhook?: Webhook;

    // League Play Report Cards
    @ManyToOne(() => Webhook, {nullable: true})
    @Field(() => Webhook, {nullable: true})
    matchReportCardWebhook?: Webhook;

    // Submissions Ready for Ratification or Failed
    @ManyToOne(() => Webhook, {nullable: true})
    @Field(() => Webhook, {nullable: true})
    submissionWebhook?: Webhook;

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
}
