import {Injectable, Logger} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {config} from "@sprocketbot/common";

import type {AccessToken, AuthPayload} from "./types";

@Injectable()
export class OauthService {
    private readonly logger = new Logger(OauthService.name);

    constructor(private jwtService: JwtService) {}

    async login(user: AuthPayload): Promise<AccessToken> {
        const payload = {username: user.username, sub: user.userId};
        return {
            access_token: this.jwtService.sign(payload, {expiresIn: config.auth.access_expiry}),
            refresh_token: this.jwtService.sign(payload, {expiresIn: config.auth.refresh_expiry}),
        };
    }

    async loginDiscord(user: AuthPayload): Promise<AccessToken> {
        return {
            access_token: this.jwtService.sign(user, {expiresIn: config.auth.access_expiry}),
            refresh_token: this.jwtService.sign(user, {expiresIn: config.auth.refresh_expiry}),
        };
    }

    async refreshTokens(
        user: AuthPayload,
        refreshToken: string,
    ): Promise<AccessToken> {
        this.logger.verbose(refreshToken);
        const tokens = await this.loginDiscord(user);
        return tokens;
    }
}
