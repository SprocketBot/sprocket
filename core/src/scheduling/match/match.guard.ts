import {Injectable} from "@nestjs/common";
import type {GraphQLExecutionContext} from "@nestjs/graphql";

import type {JwtAuthPayload} from "../../authentication/types";
import type {AbstractMemberPlayerGuardGetOptions} from "../../authorization/guards";
import {AbstractMemberPlayerGuard} from "../../authorization/guards";
import {PlayerRepository} from "../../franchise/database/player.repository";
import {PopulateService} from "../../util";
import {Match} from "../database/match.entity";

@Injectable()
export class MatchPlayerGuard extends AbstractMemberPlayerGuard {
    constructor(readonly playerRepository: PlayerRepository, private readonly populateService: PopulateService) {
        super();
    }

    async getGameAndOrganization(
        ctx: GraphQLExecutionContext,
        userPayload: JwtAuthPayload,
    ): Promise<AbstractMemberPlayerGuardGetOptions | undefined> {
        if (!userPayload.currentOrganizationId) throw new Error("User is not connected to an organization");

        const match = ctx.getRoot<Match>();
        const gameMode = await this.populateService.populateOneOrFail(Match, match, "gameMode");

        return {
            gameId: gameMode.gameId,
            organizationId: userPayload.currentOrganizationId,
        };
    }
}
