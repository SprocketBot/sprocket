import {Entity, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {MatchParent} from "./match-parent.entity";

@Entity({schema: "sprocket"})
export class ScrimMeta extends BaseEntity {
    @OneToOne(() => MatchParent, mp => mp.scrimMeta)
    parent: MatchParent;
}
