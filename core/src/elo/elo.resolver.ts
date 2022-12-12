import {UseGuards} from "@nestjs/common";
import {Mutation, Resolver} from "@nestjs/graphql";
import {DataSource} from "typeorm";

import {GraphQLJwtAuthGuard} from "../authentication/guards";
import {MLE_OrganizationTeam} from "../database/mledb";
import {MLEOrganizationTeamGuard} from "../mledb/mledb-player/mle-organization-team.guard";
import {EloService} from "./elo.service";
import type {NewPlayerBySalary} from "./elo-connector";
import {EloConnectorService, EloEndpoint} from "./elo-connector";

@Resolver()
export class EloResolver {
    constructor(
        private readonly eloService: EloService,
        private readonly eloConnectorService: EloConnectorService,
        private readonly dataSource: DataSource,
    ) {}

    @Mutation(() => String)
    @UseGuards(GraphQLJwtAuthGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async generateMigrationData(): Promise<string> {
        await this.eloService.prepMigrationData();
        return "Done.";
    }

    @Mutation(() => String)
    @UseGuards(GraphQLJwtAuthGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async runEloMigration(): Promise<string> {
        const inputData = await this.eloService.prepMigrationData();
        await this.eloConnectorService.createJob(EloEndpoint.AddNewPlayers, inputData);
        return "Migration started.";
    }

    @Mutation(() => Boolean)
    @UseGuards(GraphQLJwtAuthGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async reinitEloDb(): Promise<boolean> {
        const players = (await this.dataSource.query(`
        SELECT player.id,
               mp.name,
               player.salary,
               gsg.ordinal AS "skillGroup"
            FROM player
                     INNER JOIN member_profile mp ON player."memberId" = mp."memberId"
                     INNER JOIN game_skill_group gsg ON player."skillGroupId" = gsg.id
                     INNER JOIN mledb_bridge.player_to_player p2p ON p2p."sprocketPlayerId" = player.id
                     INNER JOIN mledb.player mlep ON mlep.id = p2p."mledPlayerId";
    `)) as NewPlayerBySalary[];

        for (const p of players) {
            await this.eloConnectorService.createJob(EloEndpoint.AddPlayerBySalary, p);
        }

        return false;
    }
}
