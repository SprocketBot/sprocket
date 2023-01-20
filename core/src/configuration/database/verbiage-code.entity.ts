import {Column, Entity} from "typeorm";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class VerbiageCode extends BaseEntity {
    @Column()
    code: string;

    @Column()
    default: string;
}
