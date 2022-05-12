import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
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

    @OneToOne(() => Franchise)
    @Field(() => Franchise)
    franchise: Franchise;
}
