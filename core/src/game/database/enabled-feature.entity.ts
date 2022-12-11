import {Entity, ManyToOne} from "typeorm";

import {Organization} from "";
import {GameFeature} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class EnabledFeature extends BaseEntity {
    @ManyToOne(() => GameFeature)
    feature: GameFeature;

    @ManyToOne(() => Organization)
    organization: Organization;
}
