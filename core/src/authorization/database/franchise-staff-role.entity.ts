import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {Game} from "../../game/database/game.entity";
import {BaseEntity} from "../../types/base-entity";
import {PermissionBearer} from "./permission-bearer.entity";

@Entity({schema: "sprocket"})
export class FranchiseStaffRole extends BaseEntity {
    @Column()
    name: string;

    @Column()
    ordinal: number;

    @ManyToOne(() => PermissionBearer)
    @JoinColumn()
    bearer: PermissionBearer;

    @ManyToOne(() => Game)
    game: Game;
}
