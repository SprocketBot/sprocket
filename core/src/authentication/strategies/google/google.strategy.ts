import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {Request} from "express";
import type {ParamsDictionary} from "express-serve-static-core";
import type {VerifyCallback} from "passport-google-oauth20";
import {Strategy} from "passport-google-oauth20";
import type {ParsedQs} from "qs";

import type {GoogleProfile} from "./google.types";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor(private readonly jwtService: JwtService) {
        super({
            clientID: config.auth.google.clientId,
            clientSecret: config.auth.google.secret,
            callbackURL: config.auth.google.callbackUrl,
            scope: ["email", "profile"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback,
    ): Promise<GoogleProfile | undefined> {
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
