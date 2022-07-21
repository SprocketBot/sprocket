import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, ManyToOne, OneToMany, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {FranchiseGroupProfile} from "../franchise_group_profile";
import {FranchiseGroupType} from "../franchise_group_type";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseGroup extends BaseModel {
    @ManyToOne(() => FranchiseGroup, {nullable: true})
    @Field(() => FranchiseGroup, {nullable: true})
    parentGroup?: FranchiseGroup;

    @OneToMany(() => FranchiseGroup, fg => fg.parentGroup)
    @Field(() => [FranchiseGroup])
    childGroups: FranchiseGroup[];

    @ManyToOne(() => FranchiseGroupType)
    @Field(() => FranchiseGroupType)
    type: FranchiseGroupType;

    @OneToOne(() => FranchiseGroupProfile)
    @Field(() => FranchiseGroupProfile)
    profile: FranchiseGroupProfile;
}
