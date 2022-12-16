import {Column, Entity} from "typeorm";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Webhook extends BaseEntity {
    @Column()
    url: string;

    @Column()
    description: string;
}
