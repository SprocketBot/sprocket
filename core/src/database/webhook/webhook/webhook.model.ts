import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity} from "typeorm";

import {BaseModel} from "../../base-model";
@Entity({schema: "sprocket"})
@ObjectType()
export class Webhook extends BaseModel {
    @Column()
    @Field(() => String)
    url: string;

    @Column()
    @Field(() => String)
    description: string;
}
