import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, OneToMany} from "typeorm";

import {BaseModel} from "../../base-model";
import {FranchiseGroup} from "../franchise_group/franchise_group.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseGroupType extends BaseModel {
    @Column()
    @Field(() => String)
    code: string;

    @Column()
    @Field(() => String)
    description: string;

    @OneToMany(() => FranchiseGroup, fg => fg.type)
    @Field(() => [FranchiseGroup])
    franchiseGroups: FranchiseGroup[];
}
