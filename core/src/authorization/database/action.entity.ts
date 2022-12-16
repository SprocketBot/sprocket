import {Column, Entity} from "typeorm";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Action extends BaseEntity {
    @Column()
    description: string;

    @Column()
    code: string;
}
