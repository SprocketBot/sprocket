import {Entity, OneToOne} from "typeorm";

import {MatchParent} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class ScrimMeta extends BaseEntity {
    @OneToOne(() => MatchParent, mp => mp.scrimMeta)
    parent: MatchParent;
}
