import {UseGuards} from "@nestjs/common";
import {Mutation, Resolver} from "@nestjs/graphql";

import {MLE_OrganizationTeam} from "../database/mledb";
import {GqlJwtGuard} from "../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../mledb/mledb-player/mle-organization-team.guard";
import {EloService} from "./elo.service";
import {EloConnectorService, EloEndpoint} from "./elo-connector";

@Resolver()
export class EloResolver {
    constructor(
        private readonly eloService: EloService,
        private readonly eloConnectorService: EloConnectorService,
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
}
