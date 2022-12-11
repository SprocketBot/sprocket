import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Member} from "";
import {MatchParent} from "";
import {Game, GameMode} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class ScheduledEvent extends BaseEntity {
    @Column()
    description: string;

    @Column()
    start: Date;

    @Column({nullable: true})
    end?: Date;

    @Column({nullable: true})
    url?: string;

    @ManyToOne(() => Member, {nullable: true})
    host?: Member;

    @ManyToOne(() => GameMode, {nullable: true})
    gameMode?: GameMode;

    @ManyToOne(() => Game, {nullable: true})
    game?: Game;

    @OneToMany(() => MatchParent, mp => mp.event, {nullable: true})
    matchParents?: MatchParent;
}
