import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Team} from "";
import {PlayerStatLine} from "";
import {Round} from "";

import {BaseEntity} from "../../types/base-entity";

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
