import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {ScheduleFixture} from "../../database";

@Injectable()
export class ScheduleFixtureService {
    constructor(@InjectRepository(ScheduleFixture)
    private readonly scheduleFixtureRepo: Repository<ScheduleFixture>) {}

    async getFixturesForGroup(groupId: number): Promise<ScheduleFixture[]> {
        return this.scheduleFixtureRepo.find({
            where: {
                scheduleGroup: {
                    id: groupId,
                },
            },
            relations: ["scheduleGroup"],
        });
    }
}
