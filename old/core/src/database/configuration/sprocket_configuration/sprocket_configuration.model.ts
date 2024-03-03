import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity} from "typeorm";

import {BaseModel} from "../../base-model";

@Entity({schema: "sprocket"})
@ObjectType()
export class SprocketConfiguration extends BaseModel {
    @Column()
    @Field(() => String)
    key: string;

    @Column()
    @Field(() => String)
    value: string;
}
