import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {PermissionBearer} from "./permission-bearer.entity";

@Entity({schema: "sprocket"})
export class FranchiseLeadershipRole extends BaseEntity {
    @Column()
    name: string;

    @Column()
    ordinal: number;

    @ManyToOne(() => PermissionBearer)
    @JoinColumn()
    bearer: PermissionBearer;
}
