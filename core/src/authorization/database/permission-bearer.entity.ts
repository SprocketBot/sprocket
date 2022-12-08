import {Entity, OneToMany} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Permission} from "./permission.entity";

@Entity({schema: "sprocket"})
export class PermissionBearer extends BaseEntity {
    @OneToMany(() => Permission, p => p.bearer)
    permissions: Permission[];
}
