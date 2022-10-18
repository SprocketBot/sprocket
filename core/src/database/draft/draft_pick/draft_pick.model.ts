import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, ManyToOne, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameSkillGroup} from "../../franchise/game_skill_group";
import {Team} from "../../franchise/team";
import {ScheduleGroup} from "../../scheduling/schedule_group";
import {DraftSelection} from "../draft_selection/draft_selection.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class DraftPick extends BaseModel {
    @Column()
    @Field(() => Number)
    ordinal: number;

    @Column()
    @Field(() => Number)
    round: number;

    @ManyToOne(() => Team)
    @Field(() => Team)
    originalTeam: Team;

    @ManyToOne(() => Team)
    @Field(() => Team)
    executingTeam: Team;

    @ManyToOne(() => GameSkillGroup)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @ManyToOne(() => ScheduleGroup)
    @Field(() => ScheduleGroup)
    scheduleGroup: ScheduleGroup;

    @OneToOne(() => DraftSelection, ds => ds.draftPick, {nullable: true})
    @Field(() => DraftSelection, {nullable: true})
    selection?: DraftSelection;
}
