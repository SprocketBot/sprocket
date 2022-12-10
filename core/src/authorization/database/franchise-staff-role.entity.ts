import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {Game} from "";
import {PermissionBearer} from "";

import {BaseEntity} from "../../types/base-entity";

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
