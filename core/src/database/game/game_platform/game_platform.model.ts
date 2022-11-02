import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Game} from "../game/game.model";
import {Platform} from "../platform/platform.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class GamePlatform extends BaseModel {
    @ManyToOne(() => Game)
    @JoinColumn()
    @Field(() => Game)
    game: Game;

    @Column()
    @Field()
    gameId: number;

    @ManyToOne(() => Platform)
    @JoinColumn()
    @Field(() => Platform)
    platform: Platform;

    @Column()
    @Field()
    platformId: number;

    @Column()
    @Field()
    canSaveDemos: boolean;
}
