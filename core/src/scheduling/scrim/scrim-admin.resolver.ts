import {UseGuards} from "@nestjs/common";
import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";
import {ScrimStatus} from "@sprocketbot/common";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {Actions, CurrentMember} from "../../authorization/decorators";
import {MemberGuard} from "../../authorization/guards";
import {Member} from "../../organization/database/member.entity";
import {ScrimObject} from "../graphql/scrim/scrim.object";
import {ScrimService} from "./scrim.service";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class ScrimAdminResolver {
    constructor(private readonly scrimService: ScrimService) {}

    @Query(() => [ScrimObject])
    @Actions("ReadOrganizationScrims")
    @UseGuards(MemberGuard)
    async getAllScrims(
        @CurrentMember() member: Member,
        @Args("status", {
            type: () => ScrimStatus,
            nullable: true,
        })
        status?: ScrimStatus,
    ): Promise<ScrimObject[]> {
        const scrims = await this.scrimService.getAllScrims(member.organizationId);

        return (status ? scrims.filter(scrim => scrim.status === status) : scrims) as ScrimObject[];
    }

    @Mutation(() => ScrimObject)
    @Actions("CancelOrganizationScrims")
    async cancelScrim(@Args("scrimId") scrimId: string): Promise<ScrimObject> {
        return this.scrimService.cancelScrim(scrimId) as Promise<ScrimObject>;
    }

    @Mutation(() => Boolean)
    @Actions("LockOrganizationScrims")
    async lockScrim(
        @Args("scrimId") scrimId: string,
        @Args("reason", {nullable: true}) reason?: string,
    ): Promise<boolean> {
        return this.scrimService.setScrimLocked(scrimId, true, reason);
    }

    @Mutation(() => Boolean)
    @Actions("LockOrganizationScrims")
    async unlockScrim(@Args("scrimId") scrimId: string): Promise<boolean> {
        return this.scrimService.setScrimLocked(scrimId, false);
    }

    @Mutation(() => Boolean)
    @Actions("MessageOrganizationScrimPlayers")
    async notifyScrimPlayers(@Args("scrimId") scrimId: string, @Args("message") message: string): Promise<boolean> {
        return this.scrimService.notifyPlayers(scrimId, message);
    }
}
