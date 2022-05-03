import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinTable, ManyToMany, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameFeature} from "../game_feature";
@Entity({ schema: "sprocket" })
@ObjectType()
export class Feature extends BaseModel {
    @Column()
    @Field(() => String)
    code: string;

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
