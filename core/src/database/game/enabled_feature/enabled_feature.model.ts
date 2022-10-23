import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../../organization/models";
import {GameFeature} from "../game_feature/game_feature.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class EnabledFeature extends BaseModel {
    @ManyToOne(() => GameFeature)
    @Field(() => GameFeature)
    feature: GameFeature;

    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;
}
