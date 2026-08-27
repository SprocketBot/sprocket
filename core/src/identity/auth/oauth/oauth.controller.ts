import {
    Controller,
    ForbiddenException,
    Get,
    Logger,
    Post,
    Request,
    Response,
    UnauthorizedException,
    UseGuards,
    Body,
} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import {Request as Req, Response as Res} from "express";

import type {User} from "$db/identity/user/user.model";
import type {UserAuthenticationAccount} from "$db/identity/user_authentication_account/user_authentication_account.model";
import {UserAuthenticationAccountType} from "$db/identity/user_authentication_account/user_authentication_account_type.enum";
import {MLE_OrganizationTeam} from "$db/mledb";

import {OrgTeamPermissionResolutionService} from "../../user-org-team-permission/org-team-permission-resolution.service";
import {UserService} from "../../user";
import {DiscordAuthGuard} from "./guards";
import {JwtRefreshGuard} from "./guards/jwt-refresh.guard";
import {OauthService} from "./oauth.service";
import type {AccessToken} from "./types";
import type {UserPayload} from "./types";
import type {AuthPayload} from "./types/payload.type";
import {GqlJwtGuard} from "../gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";

/**
 * DTO for admin session management endpoints
 */
class AdminSessionRequest {
    userId?: number;
}

@Controller()
export class OauthController {
    private readonly logger = new Logger(OauthController.name);

    constructor(
        private authService: OauthService,
        private userService: UserService,
        private orgTeamPermissionResolution: OrgTeamPermissionResolutionService,
    ) {}

    @Get("login")
    @Get("discord/redirect")
    @UseGuards(DiscordAuthGuard)
    async discordAuthRedirect(@Request() req: Req, @Response() res: Res): Promise<void> {
        const ourUser = req.user as User;
        const userProfile = await this.userService.getUserProfileForUser(ourUser.id);
        const authAccounts: UserAuthenticationAccount[]
      = await this.userService.getUserAuthenticationAccountsForUser(ourUser.id);
        const discordAccount = authAccounts.find(obj => obj.accountType === UserAuthenticationAccountType.DISCORD);
        if (discordAccount) {
            const orgs = await this.orgTeamPermissionResolution.resolveOrgTeamsForUser(ourUser.id);
            const payload: AuthPayload = {
                sub: discordAccount.accountId,
                username: userProfile.displayName,
                userId: ourUser.id,
                currentOrganizationId: config.defaultOrganizationId,
                orgTeams: orgs,
                tokenVersion: userProfile.tokenVersion,
            };
            const token = await this.authService.loginDiscord(payload);
            res.redirect(`${config.auth.frontend_callback}?token=${token.access_token},${token.refresh_token}`);
            return;
        }
        throw new ForbiddenException();
    }

    @UseGuards(JwtRefreshGuard)
    @Get("refresh")
    async refreshTokens(@Request() req: Req): Promise<AccessToken> {
        const ourUser = (req as Req & {user: UserPayload;}).user;
        this.logger.verbose(`Refreshing tokens for user ${JSON.stringify(ourUser)}`);

        // Get the current user profile to check tokenVersion
        const userProfile = await this.userService.getUserProfileForUser(ourUser.userId);

        // Check if tokenVersion matches - if not, token was invalidated
        if (ourUser.tokenVersion !== userProfile.tokenVersion) {
            this.logger.warn(`Token validation failed: tokenVersion mismatch for user ${ourUser.userId}. Token was invalidated.`);
            throw new UnauthorizedException('Session invalidated - please re-login');
        }

        // Validate that the user has a Discord account that maps to them
        // This prevents stale tokens (e.g., from before email fallback was removed) from working
        const authAccounts = await this.userService.getUserAuthenticationAccountsForUser(ourUser.userId);
        const discordAccount = authAccounts.find(obj => obj.accountType === UserAuthenticationAccountType.DISCORD);

        // If no Discord account found, the token is invalid (user may have been reassigned)
        if (!discordAccount) {
            this.logger.warn(`Token validation failed: No Discord account found for user ${ourUser.userId}. User may have been reassigned.`);
            throw new UnauthorizedException('Token no longer valid - please re-login');
        }

        if (userProfile) {
            const orgs = await this.orgTeamPermissionResolution.resolveOrgTeamsForUser(ourUser.userId);
            const payload: AuthPayload = {
                sub: discordAccount.accountId,
                username: userProfile.displayName,
                userId: ourUser.userId,
                currentOrganizationId: config.defaultOrganizationId,
                orgTeams: orgs,
                tokenVersion: userProfile.tokenVersion,
            };
            const tokens = await this.authService.refreshTokens(payload, "");
            return tokens;
        }
        return {
            access_token: "",
            refresh_token: "",
        };
    }

    // ============================================================
    // Admin Session Management Endpoints
    // ============================================================

    /**
     * Force logout all users by incrementing the global token version.
     * All existing tokens will become invalid on refresh.
     */
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    @Post("admin/invalidate-all-sessions")
    async invalidateAllSessions(): Promise<{success: boolean; newTokenVersion: number}> {
        this.logger.warn("Admin force-logout all sessions triggered");

        // Get all user profiles and increment their tokenVersion
        // For now, we increment a global counter that gets checked during refresh
        // This could be optimized for large user bases, but works for MVP
        const allProfiles = await this.userService.getAllUserProfiles();
        let maxVersion = 0;

        for (const profile of allProfiles) {
            profile.tokenVersion = (profile.tokenVersion || 0) + 1;
            if (profile.tokenVersion > maxVersion) {
                maxVersion = profile.tokenVersion;
            }
        }

        await this.userService.saveUserProfiles(allProfiles);

        this.logger.warn(`Invalidated all sessions. New token version: ${maxVersion}`);
        return {success: true, newTokenVersion: maxVersion};
    }

    /**
     * Force logout a specific user by incrementing their token version.
     */
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    @Post("admin/invalidate-user-session")
    async invalidateUserSession(@Body() req: AdminSessionRequest): Promise<{success: boolean; userId: number; newTokenVersion: number}> {
        if (!req.userId) {
            throw new ForbiddenException("userId is required");
        }

        this.logger.warn(`Admin force-logout for user ${req.userId} triggered`);

        const profile = await this.userService.getUserProfileForUser(req.userId);
        if (!profile) {
            throw new ForbiddenException("User not found");
        }

        profile.tokenVersion = (profile.tokenVersion || 0) + 1;
        await this.userService.saveUserProfile(profile);

        this.logger.warn(`Invalidated session for user ${req.userId}. New token version: ${profile.tokenVersion}`);
        return {success: true, userId: req.userId, newTokenVersion: profile.tokenVersion};
    }
}
