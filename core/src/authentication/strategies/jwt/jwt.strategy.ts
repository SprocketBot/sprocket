import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {Request} from "express";
import {ExtractJwt, Strategy} from "passport-jwt";

import type {JwtPayload} from "./jwt.types";
import {JwtPayloadSchema} from "./jwt.types";

function fromAuthHeaderOrConfig(req: Request): string | undefined {
    const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return tokenFromHeader ?? config.defaultAuthToken;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: config.defaultAuthToken ? fromAuthHeaderOrConfig : ExtractJwt.fromAuthHeaderAsBearerToken(),
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
