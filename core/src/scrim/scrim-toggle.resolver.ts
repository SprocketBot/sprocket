import {Injectable, UseGuards} from "@nestjs/common";
import {Args, Mutation} from "@nestjs/graphql";

import {MLE_OrganizationTeam} from "../database/mledb";
import {MLEOrganizationTeamGuard} from "../mledb";
import {ScrimService} from "./scrim.service";

@Injectable()
export class ScrimToggleResolver {
    constructor(private readonly scrimService: ScrimService) {}

    @UseGuards(MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    @Mutation(() => Boolean)
    async setScrimsDisabled(@Args("disabled") disabled: boolean): Promise<boolean> {
        return this.setScrimsDisabled(disabled);
    }
}
