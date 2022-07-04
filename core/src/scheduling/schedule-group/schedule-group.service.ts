import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindConditions} from "typeorm";
import {Repository} from "typeorm";

import {ScheduleGroup} from "../../database";

@Injectable()
export class ScheduleGroupService {
    constructor(@InjectRepository(ScheduleGroup)
              private readonly scheduleGroupRepo: Repository<ScheduleGroup>) {
    }

    async getScheduleGroups(orgId: number, type: string, gameId?: number): Promise<ScheduleGroup[]> {
        const conditions: FindConditions<ScheduleGroup> = {
            type: {
                code: type,
                organization: {
                    id: orgId,
                },
            },
        };
        if (gameId) {
            conditions.game = {
                id: gameId,
            };
        }

        return this.scheduleGroupRepo.find({
            where: conditions,
            relations: ["type", "game"],
        });
    }

}
