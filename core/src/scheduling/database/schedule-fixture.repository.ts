import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories/repository";
import {ScheduleFixture} from "./schedule-fixture.entity";

@Injectable()
export class ScheduleFixtureRepository extends ExtendedRepository<ScheduleFixture> {
    constructor(readonly dataSource: DataSource) {
        super(ScheduleFixture, dataSource);
    }
}
