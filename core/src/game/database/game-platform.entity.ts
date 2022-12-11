import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Game} from "./game.entity";
import {Platform} from "./platform.entity";

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
