import {
    Controller, Get, Request,
    UseGuards,
} from "@nestjs/common";
import {Request as Req} from "express";
import type {User} from "src/database";

import {GoogleAuthGuard} from "./google-auth.guard";
import {DiscordAuthGuard} from "./discord-auth.guard";
import {JwtAuthGuard} from "./jwt-auth.guard";
import {OauthService} from "./oauth.service";
import {Roles} from "./roles.decorator";
import {RolesGuard} from "./roles.guard";
import type {AccessToken} from "./types/accesstoken.type";
import type {AuthPayload} from "./types/payload.type";

@Controller()
export class OauthController {
    constructor(private authService: OauthService) {}

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

    @Get()
    @Get("discord")
    @UseGuards(DiscordAuthGuard)
    async discordAuth(): Promise<void> {}

    /* eslint-disable*/
    @Get("google/redirect")
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req: Req): Promise<AccessToken> {
        const ourUser = req["user"] as User;
        const payload: AuthPayload = {
            sub: ourUser.id, username: req["username"], userId: ourUser.id,
        };
        console.log("On login: ");
        console.log(payload);
        console.log(req["user"]);
        return this.authService.login(payload);
    }
    /* eslint-enable */

    @Get("login")
    @Get("discord/redirect")
    @UseGuards(DiscordAuthGuard)
    async discordAuthRedirect(@Request() req: Req): Promise<AccessToken> {
        const ourUser = req["user"] as User;
        const payload: AuthPayload = {
            sub: ourUser.id, username: req["username"], userId: ourUser.id,
        };
        console.log("On discord login: ");
        console.log(payload);
        console.log(req["user"]);
        return this.authService.login(payload);
    }
}
