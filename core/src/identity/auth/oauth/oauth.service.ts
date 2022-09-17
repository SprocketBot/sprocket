import {Injectable, Logger} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";

import type {AccessToken, AuthPayload} from "./types";

@Injectable()
export class OauthService {
    private readonly logger = new Logger(OauthService.name);

    constructor(private jwtService: JwtService) {}

    async login(user: AuthPayload): Promise<AccessToken> {
        const payload = {username: user.username, sub: user.userId};
        return {
            access_token: this.jwtService.sign(payload, {expiresIn: "15m"}),
            refresh_token: this.jwtService.sign(payload, {expiresIn: "7d"}),
        };
    }

    async loginDiscord(user: AuthPayload): Promise<AccessToken> {
        return {
            access_token: this.jwtService.sign(user, {expiresIn: "1m"}),
            refresh_token: this.jwtService.sign(user, {expiresIn: "7d"}),
        };
    }

    async refreshTokens(user: AuthPayload, refreshToken: string): Promise<AccessToken> {
        this.logger.verbose(refreshToken);
        const tokens = await this.loginDiscord(user);
        return tokens;
    }
}
