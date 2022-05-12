import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, ManyToOne, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {EnabledFeature} from "../enabled_feature";
import {Feature} from "../feature";
import {Game} from "../game";

@Entity({schema: "sprocket"})
@ObjectType()
export class GameFeature extends BaseModel {
    @ManyToOne(() => Game)
    @Field(() => Game)
    game: Game;

    @ManyToOne(() => Feature)
    @Field(() => Feature)
    feature: Feature;

    @OneToMany(() => EnabledFeature, ef => ef.feature)
    @Field(() => [EnabledFeature])
    enabledOrgs: EnabledFeature[];
}
