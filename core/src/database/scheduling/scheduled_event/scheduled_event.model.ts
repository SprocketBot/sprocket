import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Game} from "../../game/game";
import {GameMode} from "../../game/game_mode";
import {Member} from "../../organization/member";
import {MatchParent} from "../match_parent";
@Entity({ schema: "sprocket" })
@ObjectType()
export class ScheduledEvent extends BaseModel {
    @Column()
    @Field(() => String)
    description: string;

    @Column()
    @Field(() => Date)
    start: Date;

    @Column({nullable: true})
    @Field(() => Date, {nullable: true})
    end?: Date;

    @Column({nullable: true})
    @Field(() => String, {nullable: true})
    url?: string;

    @ManyToOne(() => Member, {nullable: true})
    @Field(() => Member, {nullable: true})
    host?: Member;

    @ManyToOne(() => GameMode, {nullable: true})
    @Field(() => GameMode, {nullable: true})
    gameMode?: GameMode;

    @ManyToOne(() => Game, {nullable: true})
    @Field(() => Game, {nullable: true})
    game?: Game;

    @OneToMany(() => MatchParent, mp => mp.event, {nullable: true})
    @Field(() => MatchParent, {nullable: true})
    matchParents?: MatchParent;
}
