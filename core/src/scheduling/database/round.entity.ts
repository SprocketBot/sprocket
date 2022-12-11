import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {GameMode} from "";
import {Invalidation} from "";
import {Match} from "";
import {PlayerStatLine} from "";
import {TeamStatLine} from "";
import {Parser} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class DraftSelection extends BaseEntity {
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
