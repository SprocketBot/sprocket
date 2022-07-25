import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {MatchParent} from "../match_parent/match_parent.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class ScrimMeta extends BaseModel {
    @OneToOne(() => MatchParent, mp => mp.scrimMeta)
    @Field(() => MatchParent)
    parent: MatchParent;
}
