import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import {Strategy} from "passport-steam";

import type {SteamProfile} from "./steam.types";

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, "steam") {
    constructor(private readonly jwtService: JwtService) {
        super({
            returnURL: config.auth.steam.callbackUrl,
            realm: config.auth.steam.realm,
            apiKey: config.auth.steam.key,
            stateless: false,
        });
    }

    async validate(identifier, profile, done): Promise<SteamProfile | undefined> {
        console.log(identifier, profile);
        done(null, profile);
        return profile;
    }
}
