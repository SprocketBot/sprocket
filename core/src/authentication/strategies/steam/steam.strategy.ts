import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import {Strategy} from "passport-steam";

import type {SteamProfile} from "./steam.types";

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, "steam") {
    constructor() {
        super({
            returnURL: config.auth.steam.callbackUrl,
            realm: config.auth.steam.realm,
            apiKey: config.auth.steam.key,
        });
    }

    async validate(identifier, profile, done): Promise<SteamProfile | undefined> {
        done(null, profile);
        return profile;
    }
}
