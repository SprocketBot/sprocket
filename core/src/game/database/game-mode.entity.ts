import {Column, Entity, ManyToOne} from "typeorm";

import {Game} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class GameMode extends BaseEntity {
    @ManyToOne(() => Game)
    game: Game;

    @Column()
    gameId: number;

    @Column()
    code: string;

    @Column()
    description: string;

    @Column()
    teamSize: number;

    @Column()
    teamCount: number;
}
