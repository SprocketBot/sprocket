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

import {UserService} from "../../user";
import {OrgTeamPermissionResolutionService} from "../../user-org-team-permission/org-team-permission-resolution.service";
import {DiscordAuthGuard} from "./guards";
import {JwtRefreshGuard} from "./guards/jwt-refresh.guard";
import {OauthService} from "./oauth.service";
import type {AccessToken, UserPayload} from "./types";
import type {AuthPayload} from "./types/payload.type";

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
        throw new UnauthorizedException("Refresh token is not bound to a Discord authentication account");
    }
}
