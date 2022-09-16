import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, TableInheritance,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {WebhookType} from "./webhook.enum";

@Entity({schema: "sprocket"})
@TableInheritance({column: {type: "varchar", name: "webhookType"}})
@ObjectType()
export class Webhook extends BaseModel {
    @Column()
    @Field()
    webhookUrl: string;

    @Column({type: "enum", enum: WebhookType})
    @Field(() => WebhookType)
    type: WebhookType;
}
