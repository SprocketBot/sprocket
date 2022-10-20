import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {readFileSync} from "fs";
import {ExtractJwt, Strategy} from "passport-jwt";

import type {JwtPayload} from "./jwt.types";
import {JwtPayloadSchema} from "./jwt.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: readFileSync("./secret/jwt-secret.txt").toString().trim(),
        });
    }

    async validate(payload: unknown): Promise<JwtPayload> {
        const data = JwtPayloadSchema.safeParse(payload);
        if (!data.success) throw new Error("Failed to parse token");

        return data.data;
    }
}
