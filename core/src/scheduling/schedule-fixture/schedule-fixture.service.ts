import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {GameSkillGroup, Match, MatchParent, ScheduleFixture, ScheduleGroup} from "../../database";
import { FranchiseService } from "../../franchise/franchise";
import { MatchService } from "../match";

@Injectable()
export class ScheduleFixtureService {
    constructor(
        @InjectRepository(ScheduleFixture)
        private readonly scheduleFixtureRepo: Repository<ScheduleFixture>,
        private readonly franchiseService: FranchiseService,
        private readonly matchService: MatchService,
    ) {}

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

    async getFixtureForMatchParent(matchParentId: number): Promise<ScheduleFixture> {
        return this.scheduleFixtureRepo.findOneOrFail({
            where: {
                matchParents: {
                    id: matchParentId,
                },
            },
            relations: ["awayFranchise", "awayFranchise.profile", "homeFranchise", "homeFranchise.profile"],
        });
    }
    
    async createScheduleFixture(schedule_group: ScheduleGroup, home_name: string, away_name: string, skill_groups: GameSkillGroup[]): Promise<ScheduleFixture> {

        // Get both franchises involved
        const home = await this.franchiseService.getFranchiseByName(home_name);
        const away = await this.franchiseService.getFranchiseByName(away_name);

        // Create the fixture
        let fixture = this.scheduleFixtureRepo.create();
        fixture.scheduleGroup = schedule_group;
        fixture.homeFranchise = home;
        fixture.awayFranchise = away;
        fixture.homeFranchiseId = home.id;
        fixture.awayFranchiseId = away.id;
        
        // Create the matches and match parents
        let matches: Match[] = [];
        let mps: MatchParent[] = [];

        for (const sg of skill_groups) {
            const [m, mp] = await this.matchService.createMatchWithMatchParent(sg);
            matches.push(m);
            mps.push(mp);
        }

        // Put it all back together in the DB and return
        fixture = this.scheduleFixtureRepo.merge(
            fixture,
            {
                scheduleGroup: schedule_group,
                homeFranchise: home,
                awayFranchise: away,
                homeFranchiseId: home.id,
                awayFranchiseId: away.id,
                matchParents: mps,
                matches: matches,
            });
        return fixture;
    }
}
