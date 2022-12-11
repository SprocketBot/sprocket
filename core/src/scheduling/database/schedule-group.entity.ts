import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Game} from "";
import {ScheduleFixture} from "";
import {ScheduleGroupType} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class ScheduleGroup extends BaseEntity {
    @Column()
    start: Date;

    @Column()
    end: Date;

    @Column({nullable: true})
    description?: string;

    @ManyToOne(() => ScheduleGroupType)
    type: ScheduleGroupType;

    @ManyToOne(() => Game)
    game: Game;

    @ManyToOne(() => ScheduleGroup)
    parentGroup: ScheduleGroup;

    @OneToMany(() => ScheduleGroup, sg => sg.parentGroup)
    childGroups: ScheduleGroup[];

    @OneToMany(() => ScheduleFixture, sf => sf.scheduleGroup)
    fixtures: ScheduleFixture[];
}