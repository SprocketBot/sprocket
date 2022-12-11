import {Column, Entity, ManyToOne} from "typeorm";

import {Player} from "";
import {MatchParent} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class EligibilityData extends BaseEntity {
    @ManyToOne(() => MatchParent)
    matchParent: MatchParent;

    @Column()
    points: number;

    @ManyToOne(() => Player)
    player: Player;
}
