import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {JwtConstants} from "src/identity/auth/oauth/constants";

import type {AuthPayload} from "../types/payload.type";
import type {UserPayload} from "../types/userpayload.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JwtConstants.secret,
        });
    }

    async validate(payload: AuthPayload): Promise<UserPayload> {
        return {
            userId: payload.userId, username: payload.username, currentOrganizationId: payload.currentOrganizationId,
        };
    }
}
