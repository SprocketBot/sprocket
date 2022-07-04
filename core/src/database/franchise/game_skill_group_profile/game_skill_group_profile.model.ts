import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameSkillGroup} from "../game_skill_group";

@Entity({schema: "sprocket"})
@ObjectType()
export class GameSkillGroupProfile extends BaseModel {
    @Column({nullable: true})
    @Field({nullable: true})
    scrimReportWebhookUrl?: string;

    @Column({nullable: true})
    @Field({nullable: true})
    matchReportWebhookUrl?: string;

    @OneToOne(() => GameSkillGroup)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;
}
