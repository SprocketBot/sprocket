import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {config} from "@sprocketbot/common";

import {UserRepository} from "$repositories";

import type {JwtAuthPayload, JwtRefreshPayload} from "./strategies/jwt/jwt.types";
import {JwtType} from "./strategies/jwt/jwt.types";
import type {JwtTokenSet} from "./types";

@Injectable()
export class AuthenticationService {
    constructor(private readonly jwtService: JwtService, private readonly userRepository: UserRepository) {}

    async login(userId: number): Promise<JwtTokenSet> {
        const user = await this.userRepository.getById(userId, {relations: {profile: true, members: true}});
        const organizationId = user.members.length === 1 ? user.members[0].organizationId : undefined;

        const payload = {sub: user.id, userId: user.id};
        const authPayload: JwtAuthPayload = {
            ...payload,
            username: user.profile.displayName,
            type: JwtType.Authentication,
            currentOrganizationId: organizationId,
            orgTeams: [],
        };
        const refreshPayload: JwtRefreshPayload = {
            ...payload,
            type: JwtType.Refresh,
        };

        return {
            access: this.jwtService.sign(authPayload, {expiresIn: config.auth.access_expiry}),
            refresh: this.jwtService.sign(refreshPayload, {expiresIn: config.auth.refresh_expiry}),
        };
    }
}
