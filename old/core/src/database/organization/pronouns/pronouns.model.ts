import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../organization";

@Entity({schema: "sprocket"})
@ObjectType()
export class Pronouns extends BaseModel {
    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;

    @Column()
    @Field(() => String)
    subjectPronoun: string;

    @Column()
    @Field(() => String)
    objectPronoun: string;

    @Column()
    @Field(() => String)
    possessiveAdjective: string;

    @Column()
    @Field(() => String)
    possessivePronoun: string;

    @Column()
    @Field(() => String)
    reflexivePronoun: string;
}
