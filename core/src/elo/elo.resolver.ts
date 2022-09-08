import {Mutation, Resolver} from "@nestjs/graphql";

import {EloService} from "./elo.service";
import type {ManualSkillGroupChange} from "./elo-connector";
import {
    EloConnectorService, EloEndpoint, SkillGroup,
} from "./elo-connector";

@Resolver()
export class EloResolver {
    constructor(
        private readonly eloService: EloService,
        private readonly eloConnectorService: EloConnectorService,
    ) {}

    @Mutation(() => String)
    async generateMigrationData(): Promise<string> {
        await this.eloService.prepMigrationData();
        return "Done.";
    }

    @Mutation(() => String)
    async runEloMigration(): Promise<string> {
        const inputData = await this.eloService.prepMigrationData();
        await this.eloConnectorService.createJob(EloEndpoint.AddNewPlayers, inputData);
        return "Migration started.";
    }

    @Mutation(() => String)
    async acceptRankdown(playerId: number, salary: number, skillGroup: SkillGroup): Promise<string> {
        const inputData: ManualSkillGroupChange = {
            id: playerId,
            salary: salary,
            skillGroup: skillGroup,
        };

        await this.eloConnectorService.createJob(EloEndpoint.SGChange, inputData);
        return "Rankdown accepted";
    }
}
