import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {PassportStrategy} from "@nestjs/passport";
import { config } from "@sprocketbot/common";
import type {Request} from "express";
import type {ParamsDictionary} from "express-serve-static-core";
import type {Profile, VerifyCallback} from "passport-microsoft";
import {Strategy} from "passport-microsoft";
import type {ParsedQs} from "qs";

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, "microsoft") {
    constructor(private readonly jwtService: JwtService) {
        super({
            clientID: config.auth.microsoft.clientId,
            clientSecret: config.auth.microsoft.secret,
            callbackURL: config.auth.microsoft.callbackUrl,
            scope: ["user.read"],
            tenant: "common",
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<Profile | undefined> {
        console.log(profile);
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
