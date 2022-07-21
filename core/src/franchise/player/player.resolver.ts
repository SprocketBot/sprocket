/* eslint-disable require-atomic-updates */
import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {
    Player,
} from "../../database";
import type {GameSkillGroup} from "../../database/franchise/game_skill_group";
import {MledbPlayerService} from "../../mledb";
import {PopulateService} from "../../util/populate/populate.service";
import {FranchiseService} from "../franchise";

@Resolver(() => Player)
export class PlayerResolver {

    constructor(
        private readonly popService: PopulateService,
        private readonly mlePlayerService: MledbPlayerService,
        private readonly franchiseService: FranchiseService,
    ) {}

    @ResolveField()
    async skillGroup(@Root() player: Player): Promise<GameSkillGroup> {
        return this.popService.populateOneOrFail(Player, player, "skillGroup");
    }

    @ResolveField()
    async franchiseName(@Root() player: Player): Promise<string> {
        if (!player.member) {
            player.member = await this.popService.populateOneOrFail(Player, player, "member");
        }

        const franchiseResult = await this.franchiseService.getPlayerFranchises(player.member.userId);
        // Because we are using MLEDB right now; assume that we only have one
        return franchiseResult[0].name;
    }

    @ResolveField()
    async franchisePositions(@Root() player: Player): Promise<string[]> {
        if (!player.member) {
            player.member = await this.popService.populateOneOrFail(Player, player, "member");
        }
        const franchiseResult = await this.franchiseService.getPlayerFranchises(player.member.userId);
        // Because we are using MLEDB right now; assume that we only have one
        return franchiseResult[0].staffPositions.map(sp => sp.name);
    }
}
