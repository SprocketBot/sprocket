import {Column, Entity, ManyToOne, OneToOne} from "typeorm";

import {ScheduleGroupType} from "../../scheduling/database/schedule-group-type.entity";
import {BaseEntity} from "../../types/base-entity";
import {GameSkillGroup} from "./game-skill-group.entity";

@Entity({schema: "sprocket"})
export class RosterRoleUseLimits extends BaseEntity {
    @Column()
    code: string;

    @Column()
    perMode: number;

    @Column()
    total: number;

    @OneToOne(() => GameSkillGroup, gsg => gsg.roleUseLimits)
    skillGroup: GameSkillGroup;

    @ManyToOne(() => ScheduleGroupType)
    groupType: ScheduleGroupType;
}
