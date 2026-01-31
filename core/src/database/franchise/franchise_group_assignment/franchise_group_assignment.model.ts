import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {FranchiseGroup} from "$db/franchise/franchise_group/franchise_group.model";

import {BaseModel} from "../../base-model";
import {Game} from "../../game/game";
import {Franchise} from "../franchise/franchise.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseGroupAssignment extends BaseModel {
    @ManyToOne(() => Franchise)
    @Field(() => Franchise)
  franchise: Franchise;

    @ManyToOne(() => FranchiseGroup)
    @Field(() => FranchiseGroup)
  group: FranchiseGroup;

    @ManyToOne(() => Game)
    @Field(() => Game)
  game: Game;
}
