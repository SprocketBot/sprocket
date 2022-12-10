import {Entity, ManyToOne} from "typeorm";

import {Game} from "";
import {FranchiseGroup} from "";
import {Franchise} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class FranchiseGroupAssignment extends BaseEntity {
    @ManyToOne(() => Franchise)
    franchise: Franchise;

    @ManyToOne(() => FranchiseGroup)
    group: FranchiseGroup;

    @ManyToOne(() => Game)
    game: Game;
}
