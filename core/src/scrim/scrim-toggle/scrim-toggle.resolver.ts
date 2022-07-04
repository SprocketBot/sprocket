import {UseGuards} from "@nestjs/common";
import {
    Args, Mutation, Resolver,
} from "@nestjs/graphql";

import {MLE_OrganizationTeam} from "../../database/mledb";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../../mledb";
import {ScrimToggleService} from "./scrim-toggle.service";

@Resolver()
export class ScrimToggleResolver {
    constructor(private readonly scrimToggleService: ScrimToggleService) {}

    @Mutation(() => Boolean)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async setScrimsDisabled(@Args("disabled") disabled: boolean): Promise<boolean> {
        return disabled ? this.scrimToggleService.disableScrims() : this.scrimToggleService.enableScrims();
    }
}
