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
    DiscordAuthGuard,
} from "./guards";
import {OauthService} from "./oauth.service";
import type {AuthPayload} from "./types/payload.type";

@Controller()
export class OauthController {
    constructor(
        private authService: OauthService,
        private userService: UserService,
        @Inject(forwardRef(() => MledbPlayerService))
        private mledbUserService: MledbPlayerService,
    ) { }

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
                currentOrganizationId: config.defaultOrganizationId,
                orgTeams: orgs,
            };
            const token = await this.authService.loginDiscord(payload);
            res.redirect(`${config.auth.frontend_callback}?token=${token.access_token}`);
            return;
        }
        throw new ForbiddenException();
    }
}
