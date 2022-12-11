import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Game} from "../../game/database/game.entity";
import {BaseEntity} from "../../types/base-entity";
import {ScheduleFixture} from "./schedule-fixture.entity";
import {ScheduleGroupType} from "./schedule-group-type.entity";

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
