import {
    Controller,
    ForbiddenException,
    forwardRef,
    Get,
    Inject,
    Logger,
    Request,
    Response,
    UseGuards,
} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import {Request as Req, Response as Res} from "express";

import type {User, UserAuthenticationAccount} from "$models";
import {UserAuthenticationAccountRepository, UserProfileRepository} from "$repositories";
import {UserAuthenticationAccountType} from "$types";

import {MledbPlayerService} from "../../../mledb";
import {DiscordAuthGuard} from "./guards";
import {JwtRefreshGuard} from "./guards/jwt-refresh.guard";
import {OauthService} from "./oauth.service";
import type {AccessToken} from "./types";
import type {AuthPayload} from "./types/payload.type";

@Controller()
export class OauthController {
    private readonly logger = new Logger(OauthController.name);

    constructor(
        private authService: OauthService,
        private readonly userProfileRepository: UserProfileRepository,
        private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository,
        @Inject(forwardRef(() => MledbPlayerService))
        private mledbUserService: MledbPlayerService,
    ) {}

    @Get("login")
    @Get("discord/redirect")
    @UseGuards(DiscordAuthGuard)
    async discordAuthRedirect(@Request() req: Req, @Response() res: Res): Promise<void> {
        const ourUser = req.user as User;
        const userProfile = await this.userProfileRepository.getByUserId(ourUser.id);
        const authAccounts: UserAuthenticationAccount[] = await this.userAuthenticationAccountRepository.getByUserId(
            ourUser.id,
        );
        const discordAccount = authAccounts.find(obj => obj.accountType === UserAuthenticationAccountType.DISCORD);
        if (discordAccount) {
            const player = await this.mledbUserService.getPlayerByDiscordId(discordAccount.accountId);
            const player_to_orgs = await this.mledbUserService.getPlayerOrgs(player);
            const orgs = player_to_orgs.map(pto => pto.orgTeam);
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
        const ourUser = req.user as AuthPayload;
        this.logger.verbose(`Refreshing tokens for user ${JSON.stringify(ourUser)}`);
        const userProfile = await this.userProfileRepository.getByUserId(ourUser.userId);
        const authAccounts: UserAuthenticationAccount[] = await this.userAuthenticationAccountRepository.getByUserId(
            ourUser.userId,
        );
        const discordAccount = authAccounts.find(obj => obj.accountType === UserAuthenticationAccountType.DISCORD);
        if (discordAccount) {
            const player = await this.mledbUserService.getPlayerByDiscordId(discordAccount.accountId);
            const player_to_orgs = await this.mledbUserService.getPlayerOrgs(player);
            const orgs = player_to_orgs.map(pto => pto.orgTeam);
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
