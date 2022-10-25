import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {Request} from "express";
import type {ParamsDictionary} from "express-serve-static-core";
import {Strategy} from "passport-discord";
import type {VerifyCallback} from "passport-oauth2";
import type {ParsedQs} from "qs";

import type {DiscordProfile} from "./discord.types";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {
    constructor(private readonly jwtService: JwtService) {
        super({
            clientID: config.auth.discord.clientId,
            clientSecret: config.auth.discord.secret,
            callbackURL: config.auth.discord.callbackURL,
            scope: ["identify", "email"],
            prompt: "none",
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: DiscordProfile,
        done: VerifyCallback,
    ): Promise<DiscordProfile | undefined> {
        done(null, profile);
        return profile;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, options?: any): void {
        if (req.query.token) {
            this.jwtService.verify(req.query.token as string);
            options.state = req.query.token;
        }
        super.authenticate(req, options);
    }
}
