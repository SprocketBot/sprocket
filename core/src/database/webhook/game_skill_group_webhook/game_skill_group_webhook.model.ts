import {Field, ObjectType} from "@nestjs/graphql";
import {ChildEntity, ManyToOne} from "typeorm";

import {GameSkillGroup} from "../../franchise";
import {Webhook} from "../webhook";

@ChildEntity()
@ObjectType()
export class GameSkillGroupWebhook extends Webhook {
    @ManyToOne(() => GameSkillGroup)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;
}
