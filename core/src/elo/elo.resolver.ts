import {UseGuards} from "@nestjs/common";
import {Mutation, Resolver} from "@nestjs/graphql";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

import {MLE_OrganizationTeam} from "../database/mledb";
import {GqlJwtGuard} from "../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../mledb/mledb-player/mle-organization-team.guard";
import {EloConsumer} from "./elo.consumer";
import {EloService} from "./elo.service";
import type {NewPlayerBySalary} from "./elo-connector";
import {EloConnectorService, EloEndpoint} from "./elo-connector";

@Resolver()
export class EloResolver {
    constructor(
        private readonly eloService: EloService,
        private readonly eloConnectorService: EloConnectorService,
        private readonly eloConsumer: EloConsumer,
        @InjectDataSource() private readonly ds: DataSource,
    ) {}

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async generateMigrationData(): Promise<string> {
        await this.eloService.prepMigrationData();
        return "Done.";
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async runEloMigration(): Promise<string> {
        const inputData = await this.eloService.prepMigrationData();
        await this.eloConnectorService.createJob(EloEndpoint.AddNewPlayers, inputData);
        return "Migration started.";
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async reinitEloDb(): Promise<boolean> {
        const players = await this.ds.query(`
        SELECT player.id,
               mp.name,
               player.salary,
               gsg.ordinal AS "skillGroup"
            FROM player
                     INNER JOIN member_profile mp ON player."memberId" = mp."memberId"
                     INNER JOIN game_skill_group gsg ON player."skillGroupId" = gsg.id
                     INNER JOIN mledb_bridge.player_to_player p2p ON p2p."sprocketPlayerId" = player.id
                     INNER JOIN mledb.player mlep ON mlep.id = p2p."mledPlayerId";
    `) as NewPlayerBySalary[];

        for (const p of players) {
            await this.eloConnectorService.createJob(EloEndpoint.AddPlayerBySalary, p);
        }

        return false;
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async runSalaries(): Promise<boolean> {
        await this.eloConsumer.runSalaries();
        return true;
    }
}
