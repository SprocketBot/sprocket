import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Franchise} from "../../franchise/database/franchise.entity";
import {BaseEntity} from "../../types/base-entity";
import {MatchParent} from "./match-parent.entity";
import {ScheduleGroup} from "./schedule-group.entity";

@Entity({schema: "sprocket"})
export class ScheduleFixture extends BaseEntity {
    @ManyToOne(() => ScheduleGroup)
    scheduleGroup: ScheduleGroup;

    @ManyToOne(() => Franchise)
    homeFranchise: Franchise;

    @ManyToOne(() => Franchise)
    awayFranchise: Franchise;

    @OneToMany(() => MatchParent, mp => mp.fixture)
    matchParents: MatchParent[];

    @Column()
    awayFranchiseId: number;

    @Column()
    homeFranchiseId: number;
}
