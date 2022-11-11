import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, OneToMany} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameSkillGroup} from "../../franchise/models";
import {GameFeature} from "../game_feature/game_feature.model";
import {GameMode} from "../game_mode/game_mode.model";
import {GamePlatform} from "../game_platform/game_platform.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class Game extends BaseModel {
    @Column()
    @Field(() => String)
    title: string;

    @OneToMany(() => GameMode, gm => gm.game)
    @Field(() => [GameMode])
    modes: GameMode[];

    @OneToMany(() => GameSkillGroup, gsg => gsg.game)
    @Field(() => [GameSkillGroup])
    skillGroups: GameSkillGroup[];

    @OneToMany(() => GamePlatform, gp => gp.game)
    @Field(() => [GamePlatform])
    supportedPlatforms: GamePlatform[];

    @OneToMany(() => GameFeature, gf => gf.game)
    @Field(() => [GameFeature])
    supportedFeatures: GameFeature[];
}
