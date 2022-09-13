import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";

import type {AccessToken, AuthPayload} from "./types";

@Injectable()
export class OauthService {
    constructor(private jwtService: JwtService) {}

    async login(user: AuthPayload): Promise<AccessToken> {
        const payload = {username: user.username, sub: user.userId};
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async loginDiscord(user: AuthPayload): Promise<AccessToken> {
        return {
            access_token: this.jwtService.sign(user),
        };
    }
}
