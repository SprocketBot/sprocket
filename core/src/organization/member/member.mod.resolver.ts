import {
    forwardRef, Inject, UseGuards,
} from "@nestjs/common";
import {
    Args, Int, Mutation, Resolver,
} from "@nestjs/graphql";
import {DataSource} from "typeorm";
import {AnalyticsEndpoint, AnalyticsService} from "@sprocketbot/common";

import {Member} from "$db/organization/member/member.model";

import type {MLE_Player} from "../../database/mledb";
import {MLE_OrganizationTeam, MLE_Platform} from "../../database/mledb";
import {PlatformService} from "../../game";
import {CurrentUser} from "../../identity/auth/current-user.decorator";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {UserPayload} from "../../identity/auth/oauth";
import {MledbPlayerAccountService, MledbPlayerService} from "../../mledb";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {MemberPlatformAccountService} from "../member-platform-account";
import {MemberFixService} from "./member.service";

@Resolver()
export class MemberModResolver {
    constructor(
        private readonly memberPlatformAccountService: MemberPlatformAccountService,
        private readonly platformService: PlatformService,
    @Inject(forwardRef(() => MledbPlayerService))
    private readonly mledbPlayerService: MledbPlayerService,
    @Inject(forwardRef(() => MledbPlayerAccountService))
    private readonly mledbPlayerAccountService: MledbPlayerAccountService,
        private readonly memberFixService: MemberFixService,
        private readonly dataSource: DataSource,
        private readonly analyticsService: AnalyticsService,
    ) { }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async reportMemberPlatformAccount(
    @CurrentUser() cu: UserPayload,
    @Args("sprocketUserId", {type: () => Int}) userId: number,
    @Args("organizationId", {type: () => Int}) organizationId: number,
    @Args("tracker", {type: () => String}) tracker: string,
    @Args("platform", {type: () => String}) platform: string,
    @Args("platformId", {type: () => String}) platformId: string,
    ): Promise<string> {
        const normalizedPlatform = this.normalizePlatformCode(platform);
        const output: string = `User ${cu.userId} initiated: Member platform account ${normalizedPlatform}/${platformId} reported for user ${userId} in org ${organizationId}.`;
        const platform_code: MLE_Platform = MLE_Platform[normalizedPlatform];

        try {
            if (!platform_code) {
                throw new Error(`Unsupported platform: ${platform}`);
            }
            await this.dataSource.transaction(async manager => {
                // We associate the platform account with the user's member in the org
                const member: Member = await manager.getRepository(Member).findOneOrFail({
                    where: {organization: {id: organizationId}, user: {id: userId} },
                });
                const plat = await this.platformService.getPlatformByCode(normalizedPlatform, manager);
                await this.memberPlatformAccountService.createMemberPlatformAccount(
                    member,
                    plat.id,
                    platformId,
                    manager,
                );

                // as well as the user's MLE_Player in the MLEDB schema
                const mle_player: MLE_Player = await this.mledbPlayerService.getMlePlayerBySprocketUser(userId);
                await this.mledbPlayerAccountService.createOrUpdatePlayerAccount(
                    cu.userId,
                    platform_code,
                    tracker,
                    platformId,
                    mle_player,
                    manager,
                );
            });

            await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "report_member_platform_account",
                tags: [
                    ["status", "success"],
                    ["platform", normalizedPlatform],
                    ["organization_id", String(organizationId)],
                ],
                ints: [
                    ["sprocket_user_id", userId],
                    ["reporting_user_id", cu.userId],
                ],
                strings: [
                    ["platform_id", platformId],
                    ["tracker", tracker],
                ],
            });
        } catch (e) {
            await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "report_member_platform_account",
                tags: [
                    ["status", "error"],
                    ["platform", normalizedPlatform],
                    ["organization_id", String(organizationId)],
                ],
                ints: [
                    ["sprocket_user_id", userId],
                    ["reporting_user_id", cu.userId],
                ],
                strings: [
                    ["platform_id", platformId],
                    ["tracker", tracker],
                    ["error_message", e instanceof Error ? e.message : String(e)],
                ],
            });
            throw e;
        }

        return output;
    }

    @Mutation(() => String) // Changed return type to String
    async relinkPlatformAccount(
    @Args("sprocketUserId") sprocketUserId: string,
    @Args("platformId") platformId: string,
    ): Promise<string> {
        try {
            // Execute the service logic
            await this.memberFixService.updateMemberAndPlayerIds(Number(sprocketUserId), platformId);

            // Return success message
            return "Successfully relinked and associated platform account.";
        } catch (e) {
            // In case of failure, return the stringified error for debugging/feedback
            // We check if e is an Error object to get the message specifically
            return JSON.stringify(e instanceof Error ? e.message : e);
        }
    }

    private normalizePlatformCode(platform: string): string {
        const upper = platform.toUpperCase();
        if (upper === "PSN") return "PS4";
        if (upper === "XBL") return "XBOX";
        return upper;
    }
}
