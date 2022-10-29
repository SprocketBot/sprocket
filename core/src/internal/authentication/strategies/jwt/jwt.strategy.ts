import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import {ExtractJwt, Strategy} from "passport-jwt";

import type {JwtPayload} from "./jwt.types";
import {JwtPayloadSchema} from "./jwt.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.auth.jwt.secret,
        });
    }

    async validate(payload: unknown): Promise<JwtPayload> {
        const data = JwtPayloadSchema.safeParse(payload);
        if (!data.success) throw new Error("Failed to parse token");

        return data.data;
    }
}
