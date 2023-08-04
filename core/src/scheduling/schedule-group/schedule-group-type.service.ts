import {Injectable} from "@nestjs/common";

import type { ScheduleGroupType } from "../database/schedule-group-type.entity";
import { ScheduleGroupTypeRepository } from "../database/schedule-group-type.repository";

@Injectable()
export class ScheduleGroupTypeService {
    constructor(
        private readonly scheduleGroupRepo: ScheduleGroupTypeRepository
    ) {}

    async getScheduleGroupTypes(orgId: number): Promise<ScheduleGroupType[]> {
        return this.scheduleGroupRepo.find({
            where: {
                organization: {
                    id: orgId,
                },
            },
            relations: ["organization"],
        });
    }
}