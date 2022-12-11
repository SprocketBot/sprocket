import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Organization} from "";
import {ScheduleGroup} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class ScheduleGroupType extends BaseEntity {
    @ManyToOne(() => Organization)
    organization: Organization;

    @Column()
    organizationId: number;

    @Column()
    name: string;

    @Column()
    code: string;

    @OneToMany(() => ScheduleGroup, sg => sg.type)
    scheduleGroups: ScheduleGroup[];
}
