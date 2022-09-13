import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinTable, ManyToMany, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameSkillGroup} from "../../franchise";
import {GameFeature} from "../game_feature";
import {GameMode} from "../game_mode";
import {Platform} from "../platform";

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
