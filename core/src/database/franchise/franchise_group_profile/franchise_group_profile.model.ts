import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {FranchiseGroup} from "../franchise_group";
@Entity({ schema: "sprocket" })
@ObjectType()
export class FranchiseGroupProfile extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @OneToOne(() => FranchiseGroup)
    @Field(() => FranchiseGroup)
    group: FranchiseGroup;
}
