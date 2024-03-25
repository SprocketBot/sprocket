import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { forwardRef, Inject, UseGuards } from "@nestjs/common";
import { PlatformService } from "../../game";
import { MemberPlatformAccountService } from "../member-platform-account";
import { MledbPlayerAccountService, MledbPlayerService } from "../../mledb";
import { MLE_OrganizationTeam, MLE_Platform, MLE_Player } from "../../database/mledb";
import { Member } from "../../database";
import { MemberService } from "./member.service";
import { GqlJwtGuard } from "../../identity/auth/gql-auth-guard";
import { MLEOrganizationTeamGuard } from "../../mledb/mledb-player/mle-organization-team.guard";

@Resolver()
export class MemberModResolver {
    constructor(
        private readonly memberService: MemberService,
        private readonly memberPlatformAccountService: MemberPlatformAccountService,
        private readonly platformService: PlatformService,
        @Inject(forwardRef(() => MledbPlayerService))
        private readonly mledbPlayerService: MledbPlayerService,
        @Inject(forwardRef(() => MledbPlayerAccountService))
        private readonly mledbPlayerAccountService: MledbPlayerAccountService,

    ) { }

    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    @Mutation(() => String)
    async reportMemberPlatformAccount(
        @Args("sprocketUserId", { type: () => Int }) userId: number,
        @Args("organizationId", { type: () => Int }) organizationId: number,
        @Args("tracker", { type: () => String }) tracker: string,
        @Args("platform", { type: () => String }) platform: string,
        @Args("platformId", { type: () => String }) platformId: string,
    ): Promise<string> {
        const debugStr: string = `Member platform account ${platform}/${platformId} reported for user ${userId} in org ${organizationId}.`;
        console.log(debugStr)
        const platform_code: MLE_Platform = MLE_Platform[platform.toUpperCase()]
        
        // We associate the platform account with the user's member in the org
        const member: Member = await this.memberService.getMember({ where: { organization: { id: organizationId }, user: { id: userId } } });
        const plat = await this.platformService.getPlatformByCode(platform);
        await this.memberPlatformAccountService.createMemberPlatformAccount(member, plat.id, platformId);
        
        // as well as the user's MLE_Player in the MLEDB schema
        const mle_player: MLE_Player = await this.mledbPlayerService.getMlePlayerBySprocketUser(userId);
        await this.mledbPlayerAccountService.createOrUpdatePlayerAccount(platform_code, tracker, platformId, mle_player);
        
        return debugStr;
    }
}