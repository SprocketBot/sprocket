import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Player} from "../../franchise/player";
import {MatchParent} from "../match_parent";
@Entity({ schema: "sprocket" })
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
