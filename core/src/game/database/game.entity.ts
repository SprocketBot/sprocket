import {Column, Entity, OneToMany} from "typeorm";

import {GameSkillGroup} from "../../franchise/database/game-skill-group.entity";
import {BaseEntity} from "../../types/base-entity";
import {GameFeature} from "./game-feature.entity";
import {GameMode} from "./game-mode.entity";
import {GamePlatform} from "./game-platform.entity";

@Entity({schema: "sprocket"})
export class Game extends BaseEntity {
    @Column()
    title: string;

    @OneToMany(() => GameMode, gm => gm.game)
    modes?: GameMode[];

    @OneToMany(() => GameSkillGroup, gsg => gsg.game)
    skillGroups?: GameSkillGroup[];

    @OneToMany(() => GamePlatform, gp => gp.game)
    supportedPlatforms?: GamePlatform[];

    @OneToMany(() => GameFeature, gf => gf.game)
    supportedFeatures?: GameFeature[];
}
