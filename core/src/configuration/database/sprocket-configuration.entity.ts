import {Column, Entity} from "typeorm";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class SprocketConfiguration extends BaseEntity {
    @Column()
    key: string;

    @Column()
    value: string;
}
