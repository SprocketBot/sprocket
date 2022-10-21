import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {VerifyCallback} from "passport-oauth2";
import {InternalOAuthError, Strategy} from "passport-oauth2";

import {UserAuthenticationAccountRepository} from "$repositories";
import {UserAuthenticationAccountType} from "$types";

import type {EpicProfile} from "./epic.types";
import {EpicProfilePayload} from "./epic.types";

@Injectable()
export class EpicStrategy extends PassportStrategy(Strategy, "epic") {
    constructor(private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository) {
        super({
            authorizationURL: "https://www.epicgames.com/id/authorize",
            tokenURL: "https://api.epicgames.dev/epic/oauth/v1/token",
            clientID: config.auth.epic.clientId,
            clientSecret: config.auth.epic.secret,
            callbackURL: "https://code.local.pikaard.com:3001/authentication/epic/login",
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
    ): Promise<{id: number} | undefined> {
        const userAcc = await this.userAuthenticationAccountRepository.getOrNull({
            where: {
                accountType: UserAuthenticationAccountType.EPIC,
                accountId: profile.sub,
            },
            relations: {user: true},
        });

        if (!userAcc) {
            done(new UnauthorizedException("User not found"));
            return undefined;
        }

        done(null, userAcc.user);
        return userAcc.user;
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

                    const data = EpicProfilePayload.safeParse(JSON.parse(body));
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
