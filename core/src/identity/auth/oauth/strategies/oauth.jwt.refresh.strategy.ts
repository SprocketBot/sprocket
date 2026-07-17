import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import {ExtractJwt, Strategy} from "passport-jwt";

import type {AuthPayload, UserPayload} from "../types";
import {validateUserPayload} from "../validated-user-payload";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.auth.jwt_secret,
            passReqToCallback: true,
        });
    }

    async validate(payload: AuthPayload): Promise<UserPayload> {
        return validateUserPayload(payload, "JWT refresh token");
    }
}
