import {Column, Entity, ManyToOne} from "typeorm";

import {Player} from "../../franchise/database/player.entity";
import {BaseEntity} from "../../types/base-entity";
import {Round} from "./round.entity";
import {TeamStatLine} from "./team-stat-line.entity";

@Entity({schema: "sprocket"})
export class PlayerStatLine extends BaseEntity {
    @Column({
        type: "jsonb",
    })
    stats: unknown;

    @ManyToOne(() => Round)
    round: Round;

    @Column()
    isHome: boolean;

    @ManyToOne(() => TeamStatLine)
    teamStats: TeamStatLine;

    @ManyToOne(() => Player)
    player: Player;

    @Column()
    playerId: number;
}
