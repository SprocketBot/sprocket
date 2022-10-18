import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, JoinTable, ManyToMany, OneToMany} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameSkillGroup} from "../../franchise";
import {GameFeature} from "../game_feature/game_feature.model";
import {GameMode} from "../game_mode/game_mode.model";
import {Platform} from "../platform/platform.model";

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

    @ManyToMany(() => Platform)
    @JoinTable({name: "game_platform"})
    @Field(() => [Platform])
    supportedPlatforms: Platform[];

    @OneToMany(() => GameFeature, gf => gf.game)
    @Field(() => [GameFeature])
    supportedFeatures: GameFeature[];
}
