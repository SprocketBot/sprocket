import {
    Controller, ForbiddenException, Get, Request,
    UseGuards,
} from "@nestjs/common";
import {Request as Req} from "express";
import type {User, UserAuthenticationAccount} from "../../../database";
import {UserAuthenticationAccountType} from "../../../database";
import {UserService} from "../../../identity/user/user.service";
import {MledbUserService} from "../../../mledb/mledb-user/mledb-user.service";

import {DiscordAuthGuard} from "./guards/discord-auth.guard";
import {GoogleAuthGuard} from "./guards/google-auth.guard";
import {JwtAuthGuard} from "./guards/jwt-auth.guard";
import {RolesGuard} from "./guards/roles.guard";
import {OauthService} from "./oauth.service";
import {Roles} from "./roles.decorator";
import type {AccessToken} from "./types/accesstoken.type";
import type {AuthPayload} from "./types/payload.type";

@Controller()
export class OauthController {
    constructor(
        private authService: OauthService,
        private userService: UserService,
        private mledbUserService: MledbUserService,
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
    async googleAuth(): Promise<void> {}

    @Get("discord")
    @UseGuards(DiscordAuthGuard)
    async discordAuth(): Promise<void> {}

    @Get("google/redirect")
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req: Req): Promise<AccessToken> {
        const ourUser = req.user as User;
        const userProfile = await this.userService.getUserProfileForUser(ourUser.id);
        const payload: AuthPayload = {
            sub: ourUser.id.toString(), username: userProfile.email, userId: ourUser.id,
        };
        return this.authService.login(payload);
    }

    @Get("login")
    @Get("discord/redirect")
    @UseGuards(DiscordAuthGuard)
    async discordAuthRedirect(@Request() req: Req): Promise<AccessToken> {
        const ourUser = req.user as User;
        const userProfile = await this.userService.getUserProfileForUser(ourUser.id);
        const authAccounts: UserAuthenticationAccount[] = await this.userService.getUserAuthenticationAccountsForUser(ourUser.id);
        const discordAccount = authAccounts.find(obj => obj.accountType === UserAuthenticationAccountType.DISCORD);
        if (discordAccount) {
            const player = await this.mledbUserService.getUserByDiscordId(discordAccount.accountId);
            const player_to_orgs = await this.mledbUserService.getUserOrgs(player);
            const orgs = player_to_orgs.map(pto => pto.orgTeam);
            const payload = {
                sub: discordAccount.accountId,
                username: userProfile.email,
                userId: ourUser.id,
                orgs: orgs,
            };
            return this.authService.loginDiscord(payload);
        }
        throw new ForbiddenException;    
    }
}
