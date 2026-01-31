import {
    Field, Int, ObjectType,
} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {Game} from "$db/game/game/game.model";

import {BaseModel} from "../../base-model";

@Entity({schema: "sprocket"})
@ObjectType()
export class GameMode extends BaseModel {
    @ManyToOne(() => Game)
    @Field(() => Game)
  game: Game;

    @Column()
    @Field(() => Int)
  gameId: number;

    @Column()
    @Field(() => String)
  code: string;

    @Column()
    @Field(() => String)
  description: string;

    @Column()
    @Field(() => Int)
  teamSize: number;

    @Column()
    @Field(() => Int)
  teamCount: number;
}
