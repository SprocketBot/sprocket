import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {GameSkillGroup} from "$db/franchise/game_skill_group/game_skill_group.model";
import type {Match} from "$db/scheduling/match/match.model";
import type {MatchParent} from "$db/scheduling/match_parent/match_parent.model";
import {ScheduleFixture} from "$db/scheduling/schedule_fixture/schedule_fixture.model";
import type {ScheduleGroup} from "$db/scheduling/schedule_group/schedule_group.model";

import type {MLE_Match} from "../../database/mledb";
import {
    LegacyGameMode, MLE_Fixture, MLE_Series,
} from "../../database/mledb";
import {FixtureToFixture} from "../../database/mledb-bridge/fixture_to_fixture.model";
import {SeriesToMatchParent} from "../../database/mledb-bridge/series_to_match_parent.model";
import {FranchiseService} from "../../franchise/franchise";
import {MatchService} from "../match";
import {MLERL_SkillGrouptoLeagueString} from "../schedule-group/schedule-groups.types";

@Injectable()
export class ScheduleFixtureService {
    constructor(
    @InjectRepository(ScheduleFixture)
    private readonly scheduleFixtureRepo: Repository<ScheduleFixture>,
    @InjectRepository(MLE_Fixture)
    private readonly m_fixtureRepo: Repository<MLE_Fixture>,
    @InjectRepository(MLE_Series)
    private readonly m_seriesRepo: Repository<MLE_Series>,
    @InjectRepository(FixtureToFixture)
    private readonly f2fRepo: Repository<FixtureToFixture>,
    @InjectRepository(SeriesToMatchParent)
    private readonly s2mpRepo: Repository<SeriesToMatchParent>,
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
            relations: [
                "awayFranchise",
                "awayFranchise.profile",
                "homeFranchise",
                "homeFranchise.profile",
            ],
        });
    }

    async createScheduleFixture(
        schedule_group: ScheduleGroup,
        m_match: MLE_Match,
        home_name: string,
        away_name: string,
        skill_groups: GameSkillGroup[],
    ): Promise<[ScheduleFixture, MLE_Fixture]> {
    // Get both franchises involved
        const home = await this.franchiseService.getFranchiseByName(home_name);
        const away = await this.franchiseService.getFranchiseByName(away_name);

        // Create the fixture
        let fixture = this.scheduleFixtureRepo.create({
            scheduleGroup: schedule_group,
            homeFranchise: home,
            awayFranchise: away,
            homeFranchiseId: home.id,
            awayFranchiseId: away.id,
        });

        // .. as well as the MLEDB one
        let m_fixture = this.m_fixtureRepo.create({
            match: m_match,
            matchId: m_match.id,
            homeName: home_name,
            awayName: away_name,
        });

        // Create the matches and match parents
        const matches: Match[] = [];
        const mps: MatchParent[] = [];
        const series: MLE_Series[] = [];

        const mode_strings: string[] = ["DOUBLES", "STANDARD"];
        for (const sg of skill_groups) {
            for (const mode of mode_strings) {
                // Sprocket's matches and matchParents
                const [m, mp] = await this.matchService.createMatchWithMatchParent(sg, mode);
                matches.push(m);
                mps.push(mp);

                // MLEDB's series are the equivalent concept
                const m_series = this.m_seriesRepo.create({
                    fixture: m_fixture,
                    fixtureId: m_fixture.id,
                    league: MLERL_SkillGrouptoLeagueString[sg.ordinal] as string,
                    mode: LegacyGameMode[mode] as LegacyGameMode,
                });
                await this.m_seriesRepo.save(m_series);
                series.push(m_series);

                // Also make sure there's an entry in the bridge table for this
                // series
                await this.s2mpRepo.insert({
                    seriesId: m_series.id,
                    matchParentId: mp.id,
                });
            }
        }

        // Put it all back together in the DB on the Sprocket side
        fixture = this.scheduleFixtureRepo.merge(fixture, {
            matchParents: mps,
            matches: matches,
        });
        await this.scheduleFixtureRepo.save(fixture);

        // ... and then the MLEDB side
        m_fixture = this.m_fixtureRepo.merge(m_fixture, {
            series: series,
        });
        await this.m_fixtureRepo.save(m_fixture);

        // Make sure we add an entry to the bridge table
        await this.f2fRepo.insert({
            mleFixtureId: m_fixture.id,
            sprocketFixtureId: fixture.id,
        });

        // Return what we've made
        return [fixture, m_fixture];
    }
}
