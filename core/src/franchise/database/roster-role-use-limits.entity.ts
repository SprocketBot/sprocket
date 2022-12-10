import {Column, Entity, ManyToOne, OneToOne} from "typeorm";

import {ScheduleGroupType} from "";
import {GameSkillGroup} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class FranchiseGroupProfile extends BaseEntity {
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
