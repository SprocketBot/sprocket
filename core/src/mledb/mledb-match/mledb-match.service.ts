import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {CoreEndpoint, CoreOutput} from "@sprocketbot/common";
import type {FindOperator, FindOptionsRelations} from "typeorm";
import {Raw, Repository} from "typeorm";

import {
    Franchise, GameMode, GameSkillGroup, Match, MatchParent, ScheduleFixture, ScheduleGroup, ScheduleGroupType,
} from "../../database";
import type {League, MLE_Series} from "../../database/mledb";
import {
    LegacyGameMode, MLE_Fixture, MLE_Team, MLE_TeamToCaptain,
} from "../../database/mledb";
import {MatchService} from "../../scheduling";
import {PopulateService} from "../../util/populate/populate.service";

@Injectable()
export class MledbMatchService {
    constructor(
        @InjectRepository(MLE_Fixture) private readonly fixtureRepo: Repository<MLE_Fixture>,
        @InjectRepository(MLE_Team) private readonly teamRepo: Repository<MLE_Team>,
        @InjectRepository(MLE_TeamToCaptain) private readonly teamCaptainRepo: Repository<MLE_TeamToCaptain>,
        private readonly sprocketMatchService: MatchService,
        private readonly popService: PopulateService,
    ) {}

    async getMleSeries(awayName: string, homeName: string, matchStart: Date, seasonStart: Date, mode: LegacyGameMode, league: League): Promise<MLE_Series> {
        const matchByDay: (d: Date) => FindOperator<Date> = (d: Date) => Raw<Date>((alias: string) => `DATE_TRUNC('day', ${alias}) = '${d.toISOString().split("T")[0]}'`) as unknown as FindOperator<Date>;

        const mleFixture = await this.fixtureRepo.findOneOrFail({
            where: {
                series: {
                    mode: mode,
                    league: league,
                },
                awayName: awayName,
                homeName: homeName,
                match: {
                    from: matchByDay(matchStart),
                    season: {
                        startDate: matchByDay(seasonStart),
                    },
                },
            },
            relations: {
                series: {
                    fixture: true,
                },
                match: {season: true},
            },
        });

        if (mleFixture.series.length !== 1) {
            throw new Error(`Found more than one series matching params ${JSON.stringify({
                awayName, homeName, matchStart, seasonStart, mode,
            })}`);
        }

        return mleFixture.series[0];
    }

    async getMleMatchInfoAndStakeholders(sprocketMatchId: number): Promise<CoreOutput<CoreEndpoint.GetMleMatchInfoAndStakeholders>> {
        const match = await this.sprocketMatchService.getMatchById(sprocketMatchId);
        if (!match.skillGroup) {
            match.skillGroup = await this.popService.populateOneOrFail(Match, match, "skillGroup");
        }
        if (!match.skillGroup.profile) {
            const skillGroupProfile = await this.popService.populateOneOrFail(GameSkillGroup, match.skillGroup, "profile");
            match.skillGroup.profile = skillGroupProfile;
        }
        
        const matchParent = await this.popService.populateOneOrFail(Match, match, "matchParent");

        const fixture = await this.popService.populateOne(MatchParent, matchParent, "fixture");
        if (!fixture) {
            throw new Error("Fixture not found, this may not be league play!");
        }
        const awayFranchise = await this.popService.populateOneOrFail(ScheduleFixture, fixture, "awayFranchise");
        const homeFranchise = await this.popService.populateOneOrFail(ScheduleFixture, fixture, "homeFranchise");

        const awayFranchiseProfile = await this.popService.populateOneOrFail(Franchise, awayFranchise, "profile");
        const homeFranchiseProfile = await this.popService.populateOneOrFail(Franchise, homeFranchise, "profile");

        const week = await this.popService.populateOneOrFail(ScheduleFixture, fixture, "scheduleGroup");
        const season = await this.popService.populateOneOrFail(ScheduleGroup, week, "parentGroup");
        const groupType = await this.popService.populateOneOrFail(ScheduleGroup, season, "type");
        const organization = await this.popService.populateOneOrFail(ScheduleGroupType, groupType, "organization");

        const gameMode = await this.popService.populateOneOrFail(Match, match, "gameMode");
        const game = await this.popService.populateOneOrFail(GameMode, gameMode, "game");

        const mledbMatch = await this.getMleSeries(
            awayFranchiseProfile.title,
            homeFranchiseProfile.title,
            week.start,
            season.start,
            gameMode.teamSize === 2 ? LegacyGameMode.DOUBLES : LegacyGameMode.STANDARD,
            match.skillGroup.profile.description.split(" ")[0].toUpperCase() as League,
        );

        if (!mledbMatch.fixture) throw new Error(`mledb match does not have a fixture matchId=${mledbMatch.id}`);

        const mledbFranchiseRelations: FindOptionsRelations<MLE_Team> = {
            franchiseManager: true,
            generalManager: true,
            doublesAssistantGeneralManager: true,
            standardAssistantGeneralManager: true,
        };
        
        const mledbHomeFranchise = await this.teamRepo.findOneOrFail({
            where: {name: mledbMatch.fixture.homeName},
            relations: mledbFranchiseRelations,
        });
        const mledbAwayFranchise = await this.teamRepo.findOneOrFail({
            where: {name: mledbMatch.fixture.awayName},
            relations: mledbFranchiseRelations,
        });

        const mledbHomeCaptain = await this.teamCaptainRepo.find({
            where: {
                teamName: mledbHomeFranchise.name,
                league: mledbMatch.league,
            },
            relations: {player: true},
        });

        const mledbAwayCaptain = await this.teamCaptainRepo.find({
            where: {
                teamName: mledbAwayFranchise.name,
                league: mledbMatch.league,
            },
            relations: {player: true},
        });

        const stakeholders = [
            mledbHomeFranchise.franchiseManager?.discordId,
            mledbAwayFranchise.franchiseManager?.discordId,

            mledbHomeFranchise.generalManager?.discordId,
            mledbAwayFranchise.generalManager?.discordId,

            mledbHomeFranchise.doublesAssistantGeneralManager?.discordId,
            mledbAwayFranchise.doublesAssistantGeneralManager?.discordId,

            mledbHomeFranchise.standardAssistantGeneralManager?.discordId,
            mledbAwayFranchise.standardAssistantGeneralManager?.discordId,

            ...mledbHomeCaptain.map(c => c.player.discordId),
            ...mledbAwayCaptain.map(c => c.player.discordId),
        ].filter(s => s !== null && s !== undefined) as string[];

        const stakeholdersSet = new Set(stakeholders);

        return {
            organizationId: organization.id,
            stakeholderDiscordIds: Array.from(stakeholdersSet),
            game: game.title,
            gameMode: gameMode.description,
            skillGroup: match.skillGroup.profile.description,
        };
    }
}
