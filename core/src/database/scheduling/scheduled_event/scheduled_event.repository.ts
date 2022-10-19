import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {ScheduledEvent} from "./scheduled_event.model";

@Injectable()
export class ScheduledEventRepository extends ExtendedRepository<ScheduledEvent> {
    constructor(readonly dataSource: DataSource) {
        super(ScheduledEvent, dataSource);
    }
}
