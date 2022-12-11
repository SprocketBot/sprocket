import {Column, Entity, ManyToOne} from "typeorm";

import {Player} from "";
import {Round} from "";
import {TeamStatLine} from "";

import {BaseEntity} from "../../types/base-entity";

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
}
