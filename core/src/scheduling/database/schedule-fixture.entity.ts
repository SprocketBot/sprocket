import type {Match} from "";

import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Franchise} from "";
import {MatchParent} from "";
import {ScheduleGroup} from "";

import {BaseEntity} from "../../types/base-entity";

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

    matches: Match[];

    @Column()
    awayFranchiseId: number;

    @Column()
    homeFranchiseId: number;
}
