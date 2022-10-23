import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {ScheduleGroupType} from "./schedule_group_type.model";

@Injectable()
export class ScheduleGroupTypeRepository extends ExtendedRepository<ScheduleGroupType> {
    constructor(readonly dataSource: DataSource) {
        super(ScheduleGroupType, dataSource);
    }
}
