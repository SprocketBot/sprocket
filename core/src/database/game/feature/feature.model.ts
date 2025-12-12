import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinTable, ManyToMany, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameFeature} from '$db/game/game_feature/game_feature.model';
import {FeatureCode} from "./feature.enum";

@Entity({schema: "sprocket"})
@ObjectType()
export class Feature extends BaseModel {
    @Column({type: "enum", enum: FeatureCode})
    @Field(() => FeatureCode)
    code: FeatureCode;

    @Column()
    @Field(() => String)
    description: string;

    @ManyToMany(() => Feature)
    @JoinTable({
        name: "feature_dependency",
        joinColumn: {
            name: "feature_id",
        },
        inverseJoinColumn: {
            name: "dependency_id",
        },
    })
    @Field(() => [Feature])
    dependencies: Feature[];

    @OneToMany(() => GameFeature, gf => gf.feature)
    @Field(() => [GameFeature])
    supportedGames: GameFeature[];
}
