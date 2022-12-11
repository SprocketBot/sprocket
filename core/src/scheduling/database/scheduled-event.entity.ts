import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Game} from "../../game/database/game.entity";
import {GameMode} from "../../game/database/game-mode.entity";
import {Member} from "../../organization/database/member.entity";
import {BaseEntity} from "../../types/base-entity";
import {MatchParent} from "./match-parent.entity";

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
