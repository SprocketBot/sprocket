import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories/repository";
import {ScheduleGroupType} from "./schedule-group-type.entity";

@Injectable()
export class ScheduleGroupTypeRepository extends ExtendedRepository<ScheduleGroupType> {
    constructor(readonly dataSource: DataSource) {
        super(ScheduleGroupType, dataSource);
    }
}
