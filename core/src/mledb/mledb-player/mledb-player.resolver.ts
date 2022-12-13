import {UseGuards} from "@nestjs/common";
import {Args, Field, Float, InputType, Int, Mutation, Resolver} from "@nestjs/graphql";
import {readToString} from "@sprocketbot/common";
import type {FileUpload} from "graphql-upload";
import {GraphQLUpload} from "graphql-upload";
import {z} from "zod";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {GameSkillGroupRepository} from "../../franchise/database/game-skill-group.repository";
import {League, LeagueOrdinals, MLE_OrganizationTeam, MLE_Platform, ModePreference, Timezone} from "../database";
import {MLEOrganizationTeamGuard} from "./mle-organization-team.guard";
import {MledbPlayerService} from "./mledb-player.service";

const platformTransform = {
    epic: MLE_Platform.EPIC,
    steam: MLE_Platform.STEAM,
    psn: MLE_Platform.PS4,
    xbl: MLE_Platform.XBOX,
};

@InputType()
export class IntakePlayerAccount {
    @Field(() => MLE_Platform)
    platform: MLE_Platform;

    @Field(() => String)
    platformId: string;

    @Field(() => String)
    tracker: string;
}

export const IntakeSchema = z.array(
    z
        .tuple([
            z.string(),
            z.string(),
            z.string(),
            z.nativeEnum(League),
            z.string(),
            z.enum(["PC", "XB1", "PS4"]),
            z.nativeEnum(Timezone),
            z.nativeEnum(ModePreference),
        ])
        .rest(z.string())
        .transform(
            ([
                mleid,
                discordId,
                name,
                skillGroup,
                salary,
                preferredPlatform,
                timezone,
                preferredMode,
                ...accounts
            ]) => ({
                mleid: parseInt(mleid),
                discordId: discordId,
                name: name,
                skillGroup: skillGroup,
                salary: parseFloat(salary),
                preferredPlatform: preferredPlatform,
                timezone: timezone,
                preferredMode: preferredMode,
                accounts: accounts.filter(a => a !== ""),
            }),
        ),
);

@Resolver()
export class MledbPlayerResolver {
    constructor(
        private readonly sprocketSkillGroupRepository: GameSkillGroupRepository,
        private readonly mlePlayerService: MledbPlayerService,
    ) {}

    @Mutation(() => Int)
    @UseGuards(
        GraphQLJwtAuthGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async intakePlayer(
        @Args("mleid") mleid: number,
        @Args("discordId") discordId: string,
        @Args("name") name: string,
        @Args("skillGroup", {type: () => League}) league: League,
        @Args("salary", {type: () => Float}) salary: number,
        @Args("preferredPlatform") platform: string,
        @Args("timezone", {type: () => Timezone}) timezone: Timezone,
        @Args("preferredMode", {type: () => ModePreference})
        mode: ModePreference,
        @Args("accounts", {type: () => [IntakePlayerAccount]})
        accounts: IntakePlayerAccount[],
    ): Promise<number> {
        const sg = await this.sprocketSkillGroupRepository.findOneOrFail({
            where: {ordinal: LeagueOrdinals.indexOf(league) + 1},
        });
        const player = await this.mlePlayerService.intakePlayer(
            mleid,
            name,
            discordId,
            sg.id,
            salary,
            platform,
            accounts,
            timezone,
            mode,
        );

        return player.mleid;
    }

    @Mutation(() => [Int])
    @UseGuards(
        GraphQLJwtAuthGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async intakePlayerBulk(
        @Args("files", {type: () => [GraphQLUpload]})
        files: Array<Promise<FileUpload>>,
    ): Promise<number[]> {
        const csvs = await Promise.all(files.map(async f => f.then(async _f => readToString(_f.createReadStream()))));

        const results = csvs
            .flatMap(csv => csv.split(/(?:\r)?\n/g).map(l => l.trim().split(",")))
            .filter(r => r.length > 1);
        const parsed = IntakeSchema.parse(results);

        const imported: number[] = [];

        for (const player of parsed) {
            const sg = await this.sprocketSkillGroupRepository.findOneOrFail({
                where: {ordinal: LeagueOrdinals.indexOf(player.skillGroup) + 1},
            });
            const accs = player.accounts.map(acc => {
                const match = acc.match(/rocket-league\/profile\/(\w+)\/([\w _.\-%[\]]+)/);
                if (!match) throw new Error("Failed to match tracker");

                return {
                    platform: platformTransform[match[1]] as MLE_Platform,
                    platformId: match[2],
                    tracker: acc,
                };
            });

            try {
                const newPlayer = await this.mlePlayerService.intakePlayer(
                    player.mleid,
                    player.discordId,
                    player.name,
                    sg.id,
                    player.salary,
                    player.preferredPlatform,
                    accs,
                    player.timezone,
                    player.preferredMode,
                );

                imported.push(newPlayer.mleid);
            } catch {
                continue;
            }
        }

        return imported;
    }
}
