import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Player} from "";
import {DraftPick} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class DraftSelection extends BaseEntity {
    @OneToOne(() => DraftPick)
    @JoinColumn()
    draftPick: DraftPick;

    @ManyToOne(() => Player)
    player: Player;
}
