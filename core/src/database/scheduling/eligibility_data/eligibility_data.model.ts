import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {MatchParent} from "$db/scheduling/match_parent/match_parent.model";

import {BaseModel} from "../../base-model";
import {Player} from "../../franchise/player";

@Entity({schema: "sprocket"})
@ObjectType()
export class EligibilityData extends BaseModel {
    @ManyToOne(() => MatchParent)
    @Field(() => MatchParent)
  matchParent: MatchParent;

    @Column()
    @Field(() => Number)
  points: number;

    @ManyToOne(() => Player)
    @Field(() => Player)
  player: Player;
}
