import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {Organization} from "../../organization/database/organization.entity";
import {BaseEntity} from "../../types/base-entity";
import {ScheduleGroup} from "./schedule-group.entity";

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
