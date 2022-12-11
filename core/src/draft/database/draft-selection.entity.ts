import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Player} from "../../franchise/database/player.entity";
import {BaseEntity} from "../../types/base-entity";
import {DraftPick} from "./draft-pick.entity";

@Entity({schema: "sprocket"})
export class DraftSelection extends BaseEntity {
    @OneToOne(() => DraftPick)
    @JoinColumn()
    draftPick: DraftPick;

    @ManyToOne(() => Player)
    player: Player;
}
