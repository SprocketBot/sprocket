import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {Game} from "";
import {Platform} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class GamePlatform extends BaseEntity {
    @ManyToOne(() => Game)
    @JoinColumn()
    game: Game;

    @Column()
    gameId: number;

    @ManyToOne(() => Platform)
    @JoinColumn()
    platform: Platform;

    @Column()
    platformId: number;

    @Column()
    canSaveDemos: boolean;
}
