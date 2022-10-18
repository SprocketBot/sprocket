import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Player} from "../../franchise/player";
import {DraftPick} from "../draft_pick/draft_pick.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class DraftSelection extends BaseModel {
    @OneToOne(() => DraftPick)
    @JoinColumn()
    @Field(() => DraftPick)
    draftPick: DraftPick;

    @ManyToOne(() => Player)
    @Field(() => Player)
    player: Player;
}
