import {Injectable} from "@nestjs/common";
import type {FindOptionsWhere} from "typeorm";
import {Raw} from "typeorm";
import { ScheduleGroup } from "../database/schedule-group.entity";
import { ScheduleGroupRepository } from "../database/schedule-group.repository";

@Injectable()
export class ScheduleGroupService {
    constructor(
        private readonly scheduleGroupRepo: ScheduleGroupRepository
    ) {}

    async getScheduleGroups(orgId: number, type: string, gameId?: number, current: boolean = true): Promise<ScheduleGroup[]> {
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
            //relations: ["type", "game", "childGroups"],
            relations: {
                type: true,
                game: true,
                childGroups: {
                    fixtures: {
                        homeFranchise: {
                            profile: {
                                photo: true,
                            }
                        },
                        awayFranchise: {
                            profile: {
                                photo: true,
                            }
                        }
                    } 
                }
            }
        });
    }

}