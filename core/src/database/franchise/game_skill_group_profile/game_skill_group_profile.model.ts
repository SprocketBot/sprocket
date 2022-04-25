import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameSkillGroup} from "../game_skill_group";
@Entity()
@ObjectType()
export class GameSkillGroupProfile extends BaseModel {
    @OneToOne(() => GameSkillGroup)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;
}
