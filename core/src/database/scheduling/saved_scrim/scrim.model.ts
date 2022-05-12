import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, JoinColumn, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {MatchParent} from "../match_parent/match_parent.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class ScrimMeta extends BaseModel {
    @JoinColumn()
    @OneToOne(() => MatchParent)
    @Field(() => MatchParent)
    parent: MatchParent;
}
