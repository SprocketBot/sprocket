import {Entity, ManyToOne} from "typeorm";

import {Game} from "../../game/database/game.entity";
import {BaseEntity} from "../../types/base-entity";
import {Franchise} from "./franchise.entity";
import {FranchiseGroup} from "./franchise-group.entity";

@Entity({schema: "sprocket"})
export class FranchiseGroupAssignment extends BaseEntity {
    @ManyToOne(() => Franchise)
    franchise: Franchise;

    @ManyToOne(() => FranchiseGroup)
    group: FranchiseGroup;

    @ManyToOne(() => Game)
    game: Game;
}
