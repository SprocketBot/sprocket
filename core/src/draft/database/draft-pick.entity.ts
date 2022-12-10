import {Column, Entity, ManyToOne, OneToOne} from "typeorm";

import {GameSkillGroup, Team} from "";
import {ScheduleGroup} from "";
import {DraftSelection} from "";

import {BaseEntity} from "../../types/base-entity";

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
