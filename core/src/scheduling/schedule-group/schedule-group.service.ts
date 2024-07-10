import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {DataSource, FindOptionsWhere} from "typeorm";
import {Raw, Repository} from "typeorm";

import {GameSkillGroup, ScheduleGroup} from "../../database";
import { MLERL_Leagues, RawFixture } from "./schedule-groups.types";
import { ScheduleFixtureService } from "../schedule-fixture/schedule-fixture.service";
import { GameSkillGroupService } from "../../franchise";

@Injectable()
export class ScheduleGroupService {
    constructor(
        @InjectRepository(ScheduleGroup)
        private readonly scheduleGroupRepo: Repository<ScheduleGroup>,
        private readonly scheduleFixtureService: ScheduleFixtureService,
        private readonly gameSkillGroupService: GameSkillGroupService,
        private readonly dataSource: DataSource,
    ) {
    }

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
            relations: ["type", "game"],
        });
    }

    async createSeasonSchedule(season_number: number, parsedFixtures: RawFixture): Promise<ScheduleGroup[]> {
        // Some bookkeeping structures
        let sgs: ScheduleGroup[] = [];
        let sgMap = new Map();
        let sfMap = new Map();

        // First, we do this all as one transaction
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        // Create the season schedule group
        const season_description = `Season ${season_number}`;
        let season = await this.scheduleGroupRepo.create();

        // Cheeky min and max to determine season datetime extents
        let startDate = new Date('9999-12-31T00:00:00.000Z');
        let endDate = new Date('1970-01-01T00:00:00.000Z');

        for (const fixture of parsedFixtures) {
            // First check on the start and end dates
            if (fixture.start < startDate) {
                startDate = fixture.start;
            }
            if (fixture.end > endDate) {
                endDate = fixture.end;
            }
            
            // Next, get the match week Schedule Group (or create it)
            const desc = `Week ${fixture.week}`;
            let match_week: ScheduleGroup;
            if (!sgMap.has(desc)) {
                match_week = await this.scheduleGroupRepo.create({ description: desc });
                sgMap.set(desc, match_week);
            } else {
                match_week = sgMap.get(desc);
                sfMap.set(desc, []);
            }
            
            // Finally, we need to figure out which skill groups are being
            // scheduled. This is currently MLE specific, it should ideally be
            // inferred based on the game specified in the input.
            let skill_groups: GameSkillGroup[] = [];

            for (const ord in MLERL_Leagues) {
                const val = MLERL_Leagues[ord];
                if (val == 1 && !fixture.pl) { // 1 is PREMIER
                    continue;
                } else if (val == 5 && fixture.pl) { // 5 is FOUNDATION
                    continue;
                }
                
                const sg = await this.gameSkillGroupService.getGameSkillGroup({ where: { ordinal: val } });
                skill_groups.push(sg);
            }
            
            // Now that the requisite data is in hand, create the ScheduleFixture...
            const schedule_fixture = await this.scheduleFixtureService.createScheduleFixture(match_week, fixture.home, fixture.away, skill_groups);
            // ... and add it to our list for that match week
            const new_list = sfMap.get(desc).push(schedule_fixture);
            sfMap.set(desc, new_list);
        }

        season = this.scheduleGroupRepo.merge(season, { description: season_description});
        sgs.push(season);
        for (const sg of sgMap.values()) {
            sgs.push(sg);
        }

        return sgs;
    }
}
