import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {ScheduleFixture} from "./schedule_fixture.model";

@Injectable()
export class ScheduleFixtureRepository extends ExtendedRepository<ScheduleFixture> {
    constructor(readonly dataSource: DataSource) {
        super(ScheduleFixture, dataSource);
    }
}
