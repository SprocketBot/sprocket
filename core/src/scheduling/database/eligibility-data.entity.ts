import {Column, Entity, ManyToOne} from "typeorm";

import {Player} from "../../franchise/database/player.entity";
import {BaseEntity} from "../../types/base-entity";
import {MatchParent} from "./match-parent.entity";

@Entity({schema: "sprocket"})
export class EligibilityData extends BaseEntity {
    @ManyToOne(() => MatchParent)
    matchParent: MatchParent;

    @Column()
    points: number;

    @ManyToOne(() => Player)
    player: Player;
}
