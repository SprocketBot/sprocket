import { Field, ObjectType } from "@nestjs/graphql";
import { Entity, ManyToOne } from "typeorm";

import { BaseModel } from "../../base-model";
import { Franchise } from "../franchise/franchise.model";
import {GameSkillGroup} from '$db/franchise/game_skill_group/game_skill_group.model';

@Entity({ schema: "sprocket" })
@ObjectType()
export class Team extends BaseModel {
    @ManyToOne(() => Franchise)
    @Field(() => Franchise)
    franchise: Franchise;

    @ManyToOne(() => GameSkillGroup)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;
}
