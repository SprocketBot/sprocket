import {Entity, ManyToOne, OneToMany} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {EnabledFeature} from "./enabled-feature.entity";
import {Feature} from "./feature.entity";
import {Game} from "./game.entity";

@Entity({schema: "sprocket"})
export class GameFeature extends BaseEntity {
    @ManyToOne(() => Game)
    game: Game;

    @ManyToOne(() => Feature)
    feature: Feature;

    @OneToMany(() => EnabledFeature, ef => ef.feature)
    enabledOrgs: EnabledFeature[];
}
