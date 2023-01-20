import {Entity, JoinColumn, ManyToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Action} from "./action.entity";
import {PermissionBearer} from "./permission-bearer.entity";

@Entity({schema: "sprocket"})
export class Permission extends BaseEntity {
    @ManyToOne(() => Action)
    @JoinColumn()
    action: Action;

    @ManyToOne(() => PermissionBearer)
    @JoinColumn()
    bearer: PermissionBearer;
}
