import {Column, Entity, OneToMany} from "typeorm";

import {GameSkillGroup} from "";
import {GameFeature} from "";
import {GameMode} from "";
import {GamePlatform} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Game extends BaseEntity {
    @Column()
    title: string;

    @OneToMany(() => GameMode, gm => gm.game)
    modes: GameMode[];

    @OneToMany(() => GameSkillGroup, gsg => gsg.game)
    skillGroups: GameSkillGroup[];

    @OneToMany(() => GamePlatform, gp => gp.game)
    supportedPlatforms: GamePlatform[];

    @OneToMany(() => GameFeature, gf => gf.game)
    supportedFeatures: GameFeature[];
}
