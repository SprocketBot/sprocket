import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";

import type {AccessToken} from "./types/accesstoken.type";
import type {AuthPayload} from "./types/payload.type";

@Injectable()
export class OauthService {
    constructor(private jwtService: JwtService) {}

    async login(user: AuthPayload): Promise<AccessToken> {
        const payload = {username: user.username, sub: user.userId};
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
