import {Column, Entity, JoinTable, ManyToMany, OneToMany} from "typeorm";

import {GameFeature} from "";
import {FeatureCode} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Feature extends BaseEntity {
    @Column({type: "enum", enum: FeatureCode})
    code: FeatureCode;

    @Column()
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
    dependencies: Feature[];

    @OneToMany(() => GameFeature, gf => gf.feature)
    supportedGames: GameFeature[];
}
