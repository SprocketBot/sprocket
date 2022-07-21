import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {ScheduleGroupType} from "../../database";

@Injectable()
export class ScheduleGroupTypeService {
    constructor(@InjectRepository(ScheduleGroupType)
              private readonly scheduleGroupRepo: Repository<ScheduleGroupType>) {
    }

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
