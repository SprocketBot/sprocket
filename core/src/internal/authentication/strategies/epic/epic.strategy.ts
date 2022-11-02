import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {Request} from "express";
import type {ParamsDictionary} from "express-serve-static-core";
import type {VerifyCallback} from "passport-oauth2";
import {InternalOAuthError, Strategy} from "passport-oauth2";
import type {ParsedQs} from "qs";

import type {EpicProfile} from "./epic.types";
import {EpicProfileSchema} from "./epic.types";

@Injectable()
export class EpicStrategy extends PassportStrategy(Strategy, "epic") {
    constructor(private readonly jwtService: JwtService) {
        super({
            authorizationURL: "https://www.epicgames.com/id/authorize",
            tokenURL: "https://api.epicgames.dev/epic/oauth/v1/token",
            clientID: config.auth.epic.clientId,
            clientSecret: config.auth.epic.secret,
            callbackURL: config.auth.epic.callbackURL,
            scope: "basic_profile",
            customHeaders: {
                Authorization: `basic ${btoa(`${config.auth.epic.clientId}:${config.auth.epic.secret}`)}`,
            },
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: EpicProfile,
        done: VerifyCallback,
    ): Promise<EpicProfile | undefined> {
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

    async userProfile(
        accessToken: string,
        done: (err?: Error | null | undefined, profile?: EpicProfile) => void,
    ): Promise<void> {
        this._oauth2.useAuthorizationHeaderforGET(true);
        this._oauth2.get(
            "https://api.epicgames.dev/epic/oauth/v1/userInfo",
            accessToken,
            function (err: {statusCode: number; data?: unknown} | undefined, body: string | Buffer | undefined) {
                if (err || !body) return done(new InternalOAuthError("Failed to fetch user profile", err));

                try {
                    if (body instanceof Buffer) body = body.toString();

                    const data = EpicProfileSchema.safeParse(JSON.parse(body));
                    if (!data.success)
                        return done(new InternalOAuthError("Failed to parse user profile", {statusCode: 500}));

                    done(null, data.data);
                } catch {
                    return done(new InternalOAuthError("Failed to fetch user profile", {statusCode: 500}));
                }
            },
        );
    }
}
