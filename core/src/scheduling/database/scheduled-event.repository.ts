import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {ScheduledEvent} from "./scheduled-event.entity";

@Injectable()
export class ScheduledEventRepository extends ExtendedRepository<ScheduledEvent> {
    constructor(readonly dataSource: DataSource) {
        super(ScheduledEvent, dataSource);
    }
}
