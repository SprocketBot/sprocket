import {Column, Entity, ManyToOne, OneToOne} from "typeorm";

import {GameSkillGroup} from "../../franchise/database/game-skill-group.entity";
import {Team} from "../../franchise/database/team.entity";
import {ScheduleGroup} from "../../scheduling/database/schedule-group.entity";
import {BaseEntity} from "../../types/base-entity";
import {DraftSelection} from "./draft-selection.entity";

@Entity({schema: "sprocket"})
export class DraftPick extends BaseEntity {
    @Column()
    ordinal: number;

    @Column()
    round: number;

    @ManyToOne(() => Team)
    originalTeam: Team;

    @ManyToOne(() => Team)
    executingTeam: Team;

    @ManyToOne(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @ManyToOne(() => ScheduleGroup)
    scheduleGroup: ScheduleGroup;

    @OneToOne(() => DraftSelection, ds => ds.draftPick, {nullable: true})
    selection?: DraftSelection;
}
