import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, OneToOne,
} from "typeorm";

import {FranchiseGroup} from "$db/franchise/franchise_group/franchise_group.model";

import {BaseModel} from "../../base-model";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseGroupProfile extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @OneToOne(() => FranchiseGroup)
    @JoinColumn()
    @Field(() => FranchiseGroup)
    group: FranchiseGroup;
}
