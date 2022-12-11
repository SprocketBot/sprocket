import {Parser} from "@sprocketbot/common";
import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {GameMode} from "../../game/database/game-mode.entity";
import {BaseEntity} from "../../types/base-entity";
import {Invalidation} from "./invalidation.entity";
import {Match} from "./match.entity";
import {PlayerStatLine} from "./player-stat-line.entity";
import {TeamStatLine} from "./team-stat-line.entity";

@Entity({schema: "sprocket"})
export class Round extends BaseEntity {
    @Column()
    homeWon: boolean;

    @Column({
        type: "jsonb",
    })
    roundStats: unknown;

    @Column({type: "enum", enum: Parser})
    parser: Parser;

    @Column()
    parserVersion: number;

    @Column()
    outputPath: string;

    @Column({default: false})
    isDummy: boolean;

    @ManyToOne(() => Match)
    match: Match;

    @ManyToOne(() => Invalidation, {nullable: true})
    invalidation?: Invalidation;

    @OneToMany(() => PlayerStatLine, psl => psl.round)
    playerStats: PlayerStatLine[];

    @OneToMany(() => TeamStatLine, tsl => tsl.round)
    teamStats: TeamStatLine[];

    @ManyToOne(() => GameMode)
    gameMode: GameMode;
}
