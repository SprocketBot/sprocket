import {Entity, ManyToOne, OneToMany} from "typeorm";

import {EnabledFeature} from "";
import {Feature} from "";
import {Game} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class GameFeature extends BaseEntity {
    @ManyToOne(() => Game)
    game: Game;

    @ManyToOne(() => Feature)
    feature: Feature;

    @OneToMany(() => EnabledFeature, ef => ef.feature)
    enabledOrgs: EnabledFeature[];
}
