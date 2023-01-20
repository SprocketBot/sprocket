import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import axios from "axios";
import type {Request} from "express";
import type {ParamsDictionary} from "express-serve-static-core";
import type {Profile, VerifyCallback} from "passport-microsoft";
import {Strategy} from "passport-microsoft";
import type {ParsedQs} from "qs";

import type {XboxProfile} from "./xbox.types";
import {AuthenticationRequestBodySchema, XSTSRequestBodySchema} from "./xbox.types";

@Injectable()
export class XboxStrategy extends PassportStrategy(Strategy, "xbox") {
    constructor(private readonly jwtService: JwtService) {
        super({
            clientID: config.auth.microsoft.clientId,
            clientSecret: config.auth.microsoft.secret,
            callbackURL: config.auth.xbox.callbackUrl,
            scope: ["Xboxlive.signin", "Xboxlive.offline_access"],
            tenant: "common",
            authorizationURL: "https://login.live.com/oauth20_authorize.srf",
            tokenURL: "https://login.live.com/oauth20_token.srf",
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<Profile | undefined> {
        done(null, profile);
        return profile;
    }

    async userProfile(
        accessToken: string,
        done: (err?: Error | null | undefined, profile?: XboxProfile | null) => void,
    ): Promise<void> {
        try {
            const authReq = await axios.post("https://user.auth.xboxlive.com/user/authenticate", {
                RelyingParty: "http://auth.xboxlive.com",
                TokenType: "JWT",
                Properties: {
                    AuthMethod: "RPS",
                    SiteName: "user.auth.xboxlive.com",
                    RpsTicket: `d=${accessToken}`,
                },
            });
            const authData = await AuthenticationRequestBodySchema.parse(authReq.data);

            const xstsReq = await axios.post("https://xsts.auth.xboxlive.com/xsts/authorize", {
                RelyingParty: "http://xboxlive.com",
                TokenType: "JWT",
                Properties: {
                    SandboxId: "RETAIL",
                    UserTokens: [authData.Token],
                },
            });
            const xstsData = await XSTSRequestBodySchema.parse(xstsReq.data);

            done(null, {
                id: xstsData.DisplayClaims.xui[0].xid,
                displayName: xstsData.DisplayClaims.xui[0].gtg,
            });
        } catch {
            done(new Error("Failed"), null);
        }
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
