import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Game} from "../../game/game";
import {Organization} from "../../organization/organization";
import {GameSkillGroup} from "../game_skill_group";
@Entity({ schema: "sprocket" })
@ObjectType()
export class RosterRole extends BaseModel {
    @Column()
    @Field(() => String)
    code: string;

    @Column()
    @Field(() => String)
    description: string;

    @ManyToOne(() => Game)
    @Field(() => Game)
    game: Game;

    @ManyToOne(() => GameSkillGroup)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;
}
