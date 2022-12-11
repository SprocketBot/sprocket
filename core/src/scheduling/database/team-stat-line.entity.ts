import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Team} from "../../franchise/database/team.entity";
import {BaseEntity} from "../../types/base-entity";
import {PlayerStatLine} from "./player-stat-line.entity";
import {Round} from "./round.entity";

@Entity({schema: "sprocket"})
export class TeamStatLine extends BaseEntity {
    @Column({
        type: "jsonb",
    })
    stats: unknown;

    @Column()
    teamName: string;

    @ManyToOne(() => Team, {nullable: true})
    team?: Team;

    @ManyToOne(() => Round)
    round: Round;

    @OneToMany(() => PlayerStatLine, psl => psl.teamStats)
    playerStats: PlayerStatLine[];
}
