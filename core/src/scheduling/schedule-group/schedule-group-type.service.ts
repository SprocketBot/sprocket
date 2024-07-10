import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {ScheduleGroupType} from "../../database";

@Injectable()
export class ScheduleGroupTypeService {
    constructor(@InjectRepository(ScheduleGroupType)
              private readonly scheduleGroupTypeRepo: Repository<ScheduleGroupType>) {
    }

    async getScheduleGroupTypesForOrg(orgId: number): Promise<ScheduleGroupType[]> {
        return this.scheduleGroupTypeRepo.find({
            where: {
                organization: {
                    id: orgId,
                },
            },
            relations: ["organization"],
        });
    }
}
