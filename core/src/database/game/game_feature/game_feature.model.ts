import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, ManyToOne, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {EnabledFeature} from '$db/game/enabled_feature/enabled_feature.model';
import {Feature} from '$db/game/feature/feature.model';
import {Game} from '$db/game/game/game.model';

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
