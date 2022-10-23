import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, JoinColumn, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {FranchiseGroup} from "../franchise_group/franchise_group.model";

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
