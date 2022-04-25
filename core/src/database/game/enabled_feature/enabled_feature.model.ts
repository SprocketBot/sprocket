import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../../organization/organization";
import {GameFeature} from "../game_feature";
@Entity()
@ObjectType()
export class EnabledFeature extends BaseModel {
    @ManyToOne(() => GameFeature)
    @Field(() => GameFeature)
    feature: GameFeature;

    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;
}
