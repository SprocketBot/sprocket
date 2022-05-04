import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Game} from "../../game/game";
import {Franchise} from "../franchise";
import {FranchiseGroup} from "../franchise_group";
@Entity({ schema: "sprocket" })
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
