import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { FindOptionsWhere } from "typeorm";
import {
    DataSource, Raw, Repository,
} from "typeorm";

import type { ScheduleFixture } from "../../database";
import { GameSkillGroup } from "../../database/franchise/game_skill_group/game_skill_group.model";
import { ScheduleGroup } from "../../database/scheduling/schedule_group/schedule_group.model";
import type { MLE_Fixture } from "../../database/mledb";
import { MLE_Match, MLE_Season } from "../../database/mledb";
import { MatchToScheduleGroup } from "../../database/mledb-bridge/match_to_schedule_group.model";
import { SeasonToScheduleGroup } from "../../database/mledb-bridge/season_to_schedule_group.model";
import { ScheduleFixtureService } from "../schedule-fixture/schedule-fixture.service";
import type { RawFixture } from "./schedule-groups.types";
import { MLERL_Leagues } from "./schedule-groups.types";

@Injectable()
export class ScheduleGroupService {
    constructor(
        @InjectRepository(ScheduleGroup)
        private readonly scheduleGroupRepo: Repository<ScheduleGroup>,
        @InjectRepository(MLE_Season)
        private readonly m_seasonRepo: Repository<MLE_Season>,
        @InjectRepository(MLE_Match)
        private readonly m_matchRepo: Repository<MLE_Match>,
        @InjectRepository(SeasonToScheduleGroup)
        private readonly s2sgRepo: Repository<SeasonToScheduleGroup>,
        @InjectRepository(MatchToScheduleGroup)
        private readonly m2sgRepo: Repository<MatchToScheduleGroup>,
        private readonly scheduleFixtureService: ScheduleFixtureService,
        @InjectRepository(GameSkillGroup) private gameSkillGroupRepository: Repository<GameSkillGroup>,
        private readonly dataSource: DataSource,
    ) { }

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
        const sgs: ScheduleGroup[] = [];
        const sgMap: Map<string, ScheduleGroup> = new Map();
        const mmMap: Map<string, MLE_Match> = new Map();
        const sfMap: Map<string, ScheduleFixture[]> = new Map();
        const mfMap: Map<string, MLE_Fixture[]> = new Map();

        // First, we do this all as one transaction
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        // Create the season schedule group
        const season_description = `Season ${season_number}`;
        let season = this.scheduleGroupRepo.create({ description: season_description });
        let m_season = this.m_seasonRepo.create({ seasonNumber: season_number });

        // Cheeky min and max to determine season datetime extents
        let startDate = new Date("9999-12-31T00:00:00.000Z");
        let endDate = new Date("1970-01-01T00:00:00.000Z");

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
            const match_week: ScheduleGroup
                = sgMap.get(desc) ?? this.scheduleGroupRepo.create({
                    description: desc,
                    parentGroup: season,
                    start: fixture.start,
                    end: fixture.end,
                });

            // Create the match object in the MLEB schema that corresponds to
            // this SG
            const m_match: MLE_Match
                = mmMap.get(desc) ?? this.m_matchRepo.create({
                    from: fixture.start,
                    to: fixture.end,
                    isDoubleHeader: false,
                    matchNumber: 1,
                });
            sgMap.set(desc, match_week);
            sfMap.set(desc, []);

            // Finally, we need to figure out which skill groups are being
            // scheduled. This is currently MLE specific, it should ideally be
            // inferred based on the game specified in the input.
            const skill_groups: GameSkillGroup[] = [];

            for (const ord of MLERL_Leagues) {
                const val = MLERL_Leagues[ord];
                if (val === 1 && !fixture.pl) { // 1 is PREMIER
                    continue;
                } else if (val === 5 && fixture.pl) { // 5 is FOUNDATION
                    continue;
                }

                const sg = await this.gameSkillGroupRepository.findOneOrFail({ where: { ordinal: val } });
                skill_groups.push(sg);
            }

            // Now that the requisite data is in hand, create the ScheduleFixture...
            const [schedule_fixture, m_fixture] = await this.scheduleFixtureService.createScheduleFixture(match_week, m_match, fixture.home, fixture.away, skill_groups);
            // ... and add it to our list for that match week's ScheduleGroup
            const new_list = sfMap.get(desc) ?? [];
            new_list.push(schedule_fixture);
            sfMap.set(desc, new_list);
            // Repeating ourselves for the MLEDB Match
            const m_list = mfMap.get(desc) ?? [];
            m_list.push(m_fixture);
            mfMap.set(desc, m_list);
        }

        // Now that we've looped over all the input and created the fixtures and
        // matches, loop over all of the resulting match weeks.
        for (const desc of sgMap.keys()) {
            const sg: ScheduleGroup | undefined = sgMap.get(desc);
            const sfs: ScheduleFixture[] | undefined = sfMap.get(desc);
            let m_match: MLE_Match | undefined = mmMap.get(desc);
            const m_fixtures: MLE_Fixture[] | undefined = mfMap.get(desc);

            // merge each list of fixtures to its corresponding match week SG
            if (sg) {
                this.scheduleGroupRepo.merge(sg, { fixtures: sfs });
                await this.scheduleGroupRepo.save(sg);
            }

            // Do the same for the MLEDB match
            if (m_match) {
                m_match = this.m_matchRepo.merge(m_match, { fixtures: m_fixtures });
                await this.m_matchRepo.save(m_match);

                // Also, while we're here, update the MLEDB season's match list
                const m_matches: MLE_Match[] = m_season.matches;
                m_matches.push(m_match);
                m_season = this.m_seasonRepo.merge(m_season, { matches: m_matches });
                await this.m_seasonRepo.save(m_season);
            }

            if (sg && m_match) {
                // Make an entry in the bridge tables
                await this.m2sgRepo.insert({
                    matchId: m_match.id,
                    weekScheduleGroupId: sg.id,
                });
            }
        }

        // A last touch on the season objects: we now know how long they will
        // last.
        season = this.scheduleGroupRepo.merge(season, { start: startDate, end: endDate });
        await this.scheduleGroupRepo.save(season);
        m_season = this.m_seasonRepo.merge(m_season, { startDate: startDate, endDate: endDate });
        await this.m_seasonRepo.save(m_season);

        // Make sure we update the bridge tables
        await this.s2sgRepo.insert({
            scheduleGroupId: season.id,
            seasonNumber: season_number,
        });

        // We're done touching the DB at this point, so we can commit the transaction.
        await runner.commitTransaction();

        // Finally, build just a list of the schedule groups we've created to
        // send back
        sgs.push(season);
        for (const sg of sgMap.values()) {
            sgs.push(sg);
        }

        // ... and send them back.
        return sgs;
    }
}
