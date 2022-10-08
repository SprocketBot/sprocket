import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindOptionsWhere} from "typeorm";
import {Raw, Repository} from "typeorm";

import {ScheduleGroup} from "../../database";

@Injectable()
export class ScheduleGroupService {
    constructor(
        @InjectRepository(ScheduleGroup)
        private readonly scheduleGroupRepo: Repository<ScheduleGroup>,
    ) {}

    async getScheduleGroups(
        orgId: number,
        type: string,
        gameId?: number,
        current = true,
    ): Promise<ScheduleGroup[]> {
        const conditions: FindOptionsWhere<ScheduleGroup> = {
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
        if (current) {
            conditions.start = Raw(alias => `${alias} < CURRENT_TIMESTAMP`);
            conditions.end = Raw(alias => `${alias} > CURRENT_TIMESTAMP`);
        }

        return this.scheduleGroupRepo.find({
            where: conditions,
            relations: ["type", "game"],
        });
    }
}
