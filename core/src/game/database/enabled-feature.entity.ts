import {Entity, ManyToOne} from "typeorm";

import {Organization} from "../../organization/database/organization.entity";
import {BaseEntity} from "../../types/base-entity";
import {GameFeature} from "./game-feature.entity";

@Entity({schema: "sprocket"})
export class EnabledFeature extends BaseEntity {
    @ManyToOne(() => GameFeature)
    feature: GameFeature;

    @ManyToOne(() => Organization)
    organization: Organization;
}
