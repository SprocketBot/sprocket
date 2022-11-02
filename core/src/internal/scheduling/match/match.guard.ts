import {Injectable} from "@nestjs/common";
import type {GraphQLExecutionContext} from "@nestjs/graphql";

import {Match} from "$models";
import {PlayerRepository} from "$repositories";

import {PopulateService} from "../../../util/populate/populate.service";
import type {JwtAuthPayload} from "../../authentication/types";
import {PlayerGuard} from "../../franchise/player";
import type {GameAndOrganization} from "../../franchise/player/player.types";

@Injectable()
export class MatchPlayerGuard extends PlayerGuard {
    constructor(readonly playerRepository: PlayerRepository, private readonly populateService: PopulateService) {
        super();
    }

    async getGameAndOrganization(
        ctx: GraphQLExecutionContext,
        userPayload: JwtAuthPayload,
    ): Promise<GameAndOrganization> {
        if (!userPayload.currentOrganizationId) throw new Error("User is not connected to an organization");

        const match = ctx.getRoot<Match>();
        const gameMode = await this.populateService.populateOneOrFail(Match, match, "gameMode");

        return {
            gameId: gameMode.gameId,
            organizationId: userPayload.currentOrganizationId,
        };
    }
}
