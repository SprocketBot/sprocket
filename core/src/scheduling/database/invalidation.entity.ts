import {Column, Entity} from "typeorm";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Invalidation extends BaseEntity {
    @Column()
    description: string;

    @Column()
    favorsHomeTeam: boolean;
}
