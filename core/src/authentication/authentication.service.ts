import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {config} from "@sprocketbot/common";

import {UserRepository} from "../identity/database/user.repository";
import type {JwtAuthPayload, JwtRefreshPayload} from "./strategies/jwt/jwt.types";
import {JwtType} from "./strategies/jwt/jwt.types";
import type {JwtTokenSet} from "./types";

@Injectable()
export class AuthenticationService {
    constructor(private readonly jwtService: JwtService, private readonly userRepository: UserRepository) {}

    async login(userId: number, organizationId?: number): Promise<JwtTokenSet> {
        const user = await this.userRepository.findById(userId, {relations: {profile: true, members: true}});
        const currentOrganizationId =
            organizationId ?? (user.members.length === 1 ? user.members[0].organizationId : undefined);

        const payload = {
            sub: user.id,
            userId: user.id,
            currentOrganizationId: currentOrganizationId,
        };
        const authPayload: JwtAuthPayload = {
            ...payload,
            username: user.profile.displayName,
            type: JwtType.Authentication,
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
