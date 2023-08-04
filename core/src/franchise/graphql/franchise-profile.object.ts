import { Field, ObjectType, Int } from "@nestjs/graphql";
import { FranchiseObject } from "./franchise.object";
import { Webhook } from "../../webhook/database/webhook.entity";
import { PhotoObject } from "../../organization/graphql/photo.object";

@ObjectType()
export class FranchiseProfileObject {
    @Field(() => Int)
    id: number;

    @Field(() => Date)
    createdAt: Date | undefined;

    @Field(() => Date)
    updatedAt?: Date | undefined;

    @Field()
    title: string;

    @Field()
    code: string;

    scrimReportCardWebhook?: Webhook;

    matchReportCardWebhook?: Webhook;

    submissionWebhook?: Webhook;

    @Field({nullable: true})
    submissionDiscordRoleId?: string;

    @Field(()=> PhotoObject)
    photo?: PhotoObject;

    @Field(() => FranchiseObject)
    franchise: FranchiseObject;

    @Field(() => Int)
    franchiseId: number;

    @Field(() => String)
    primaryColor: string;

    @Field(() => String)
    secondaryColor: string;
}