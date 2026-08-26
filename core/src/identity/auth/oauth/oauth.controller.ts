import {
    Controller,
    ForbiddenException,
    Get,
    Logger,
    Request,
    Response,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import {Request as Req, Response as Res} from "express";

import type {User} from "$db/identity/user/user.model";
import type {UserAuthenticationAccount} from "$db/identity/user_authentication_account/user_authentication_account.model";
import {UserAuthenticationAccountType} from "$db/identity/user_authentication_account/user_authentication_account_type.enum";

import {IdentityService} from "../../identity.service";
import {OrgTeamPermissionResolutionService} from "../../user-org-team-permission/org-team-permission-resolution.service";
import {UserService} from "../../user";
import {DiscordAuthGuard} from "./guards";
import {JwtRefreshGuard} from "./guards/jwt-refresh.guard";
import {OauthService} from "./oauth.service";
import type {AccessToken} from "./types";
import type {UserPayload} from "./types";
import type {AuthPayload} from "./types/payload.type";

@Controller()
export class OauthController {
    private readonly logger = new Logger(OauthController.name);

    constructor(
        private authService: OauthService,
        private identityService: IdentityService,
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

        // Validate that the Discord account in the token still maps to the claimed userId
        // This prevents stale tokens (e.g., from before email fallback was removed) from working
        const userFromAuthAccount = await this.identityService.getUserByAuthAccount(
            UserAuthenticationAccountType.DISCORD,
            ourUser.sub,
        );
        if (!userFromAuthAccount || userFromAuthAccount.id !== ourUser.userId) {
            this.logger.warn(`Token validation failed: Discord account ${ourUser.sub} no longer maps to user ${ourUser.userId}. User may have been reassigned.`);
            throw new UnauthorizedException('Token no longer valid - please re-login');
        }

        const userProfile = await this.userService.getUserProfileForUser(ourUser.userId);
        const authAccounts: UserAuthenticationAccount[]
      = await this.userService.getUserAuthenticationAccountsForUser(ourUser.userId);
        const discordAccount = authAccounts.find(obj => obj.accountType === UserAuthenticationAccountType.DISCORD);
        if (discordAccount) {
            const orgs = await this.orgTeamPermissionResolution.resolveOrgTeamsForUser(ourUser.userId);
            const payload: AuthPayload = {
                sub: discordAccount.accountId,
                username: userProfile.displayName,
                userId: ourUser.userId,
                currentOrganizationId: config.defaultOrganizationId,
                orgTeams: orgs,
            };
            const tokens = await this.authService.refreshTokens(payload, "");
            return tokens;
        }
        return {
            access_token: "",
            refresh_token: "",
        };
    }
}
