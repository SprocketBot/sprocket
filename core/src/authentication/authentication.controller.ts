import {Controller, Get, Request, Response, UseGuards} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import {Request as Req, Response as Res} from "express";

import type {User} from "$models";

import {AuthenticationService} from "./authentication.service";
import {DiscordAuthGuard} from "./strategies/discord/guards/discord.guard";
import {EpicAuthGuard} from "./strategies/epic/guards/epic.guard";
import {GoogleAuthGuard} from "./strategies/google/guards/google.guard";

@Controller("authentication")
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @Get("google/login")
    @UseGuards(GoogleAuthGuard)
    async googleLogin(@Request() request: Req, @Response() res: Res): Promise<void> {
        const tokens = await this.authenticationService.login((request.user as User).id);
        console.log(tokens);
        res.redirect(`${config.auth.frontend_callback}?token=${tokens.access},${tokens.refresh}`);

        return;
    }

    @Get("epic/login")
    @UseGuards(EpicAuthGuard)
    async epicLogin(@Request() request: Req, @Response() res: Res): Promise<void> {
        const tokens = await this.authenticationService.login((request.user as User).id);
        res.redirect(`${config.auth.frontend_callback}?token=${tokens.access},${tokens.refresh}`);

        return;
    }

    @Get("discord/login")
    @UseGuards(DiscordAuthGuard)
    async discordLogin(@Request() request: Req, @Response() res: Res): Promise<void> {
        const tokens = await this.authenticationService.login((request.user as User).id);
        res.redirect(`${config.auth.frontend_callback}?token=${tokens.access},${tokens.refresh}`);

        return;
    }
}
