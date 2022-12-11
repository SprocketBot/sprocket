import {Injectable} from "@nestjs/common";
import type {FindOptionsWhere} from "typeorm";
import {DataSource, Raw} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories/repository";
import {ScheduleGroup} from "./schedule-group.entity";

@Injectable()
export class ScheduleGroupRepository extends ExtendedRepository<ScheduleGroup> {
    constructor(readonly dataSource: DataSource) {
        super(ScheduleGroup, dataSource);
    }

    async getWithConditions(
        organizationId: number,
        type: string,
        gameId?: number,
        current = true,
    ): Promise<ScheduleGroup[]> {
        const conditions: FindOptionsWhere<ScheduleGroup> = {
            type: {
                code: type,
                organization: {
                    id: organizationId,
                },
            },
        };
        if (gameId) {
            conditions.game = {
                id: gameId,
            };
        }
        if (current) {
            conditions.start = Raw(alias => `${alias} < CURRENT-TIMESTAMP`);
            conditions.end = Raw(alias => `${alias} > CURRENT-TIMESTAMP`);
        }

        return this.find({
            where: conditions,
            relations: ["type", "game"],
        });
    }
}
