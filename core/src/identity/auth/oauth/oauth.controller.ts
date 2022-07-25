import {
    Controller, ForbiddenException, forwardRef, Get, Inject, Request, Response, UseGuards,
} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import {Request as Req, Response as Res} from "express";

import type {User, UserAuthenticationAccount} from "../../../database";
import {UserAuthenticationAccountType} from "../../../database";
import {MledbPlayerService} from "../../../mledb";
import {UserService} from "../../user";
import {
    DiscordAuthGuard, GoogleAuthGuard, JwtAuthGuard, RolesGuard,
} from "./guards";
import {OauthService} from "./oauth.service";
import {Roles} from "./roles.decorator";
import type {AccessToken} from "./types/accesstoken.type";
import type {AuthPayload} from "./types/payload.type";

@Controller()
export class OauthController {
    constructor(
        private authService: OauthService,
        private userService: UserService,
        @Inject(forwardRef(() => MledbPlayerService))
        private mledbUserService: MledbPlayerService,
    ) {}

    @Get("rolesTest")
    @UseGuards(RolesGuard)
    getRoles(): string | undefined {
        return "This endpoint works.";
    }

    @Get("rolesAdminTest")
    @UseGuards(RolesGuard)
    @Roles("admin")
    getAdminRoles(): string | undefined {
        return "Wow you're an admin! Cool!";
    }

    @UseGuards(JwtAuthGuard)
    @Get("profile")
    getProfile(): string | undefined {
        return "Your JWT works! Nice. ";
    }

    @Get("google")
    @UseGuards(GoogleAuthGuard)
    async googleAuth(): Promise<void> {
    }

    @Get("discord")
    @UseGuards(DiscordAuthGuard)
    async discordAuth(): Promise<void> {
    }

    @Get("google/redirect")
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req: Req): Promise<AccessToken> {
        const ourUser = req.user as User;
        const userProfile = await this.userService.getUserProfileForUser(ourUser.id);
        const payload: AuthPayload = {
            sub: ourUser.id.toString(), username: userProfile.displayName, userId: ourUser.id,
        };
        return this.authService.login(payload);
    }

    @Get("login")
    @Get("discord/redirect")
    @UseGuards(DiscordAuthGuard)
    async discordAuthRedirect(@Request() req: Req, @Response() res: Res): Promise<void> {
        const ourUser = req.user as User;
        const userProfile = await this.userService.getUserProfileForUser(ourUser.id);
        const authAccounts: UserAuthenticationAccount[] = await this.userService.getUserAuthenticationAccountsForUser(ourUser.id);
        const discordAccount = authAccounts.find(obj => obj.accountType === UserAuthenticationAccountType.DISCORD);
        if (discordAccount) {
            const player = await this.mledbUserService.getPlayerByDiscordId(discordAccount.accountId);
            const player_to_orgs = await this.mledbUserService.getPlayerOrgs(player);
            const orgs = player_to_orgs.map(pto => pto.orgTeam);
            const payload: AuthPayload = {
                sub: discordAccount.accountId,
                username: userProfile.displayName,
                userId: ourUser.id,
                currentOrganizationId: 2,
                orgTeams: orgs,
            };
            const token = await this.authService.loginDiscord(payload);
            res.redirect(`${config.auth.frontend_callback}?token=${token.access_token}`);
            return;
        }
        throw new ForbiddenException();
    }
}
