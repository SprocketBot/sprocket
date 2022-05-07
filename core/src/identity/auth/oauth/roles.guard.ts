import type {ExecutionContext} from "@nestjs/common";
import {Injectable, Request} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {JwtService} from "@nestjs/jwt";
import {AuthGuard} from "@nestjs/passport";
import {Request as Req} from "express";
import {UserService} from "src/identity/user/user.service";

import type {AuthPayload} from "./types/payload.type";

@Injectable()
export class RolesGuard extends AuthGuard("jwt") {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private readonly userService: UserService,
    ) {
        super();
    }

    matchRoles(roles: string[], userroles: string[]): boolean {
        for (const ur of userroles) {
            if (roles.includes(ur)) {
                return true;
            }
        }
        return false;
    }

    fromHeaderOrQueryString(@Request() req: Req): string {
        if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
            return req.headers.authorization.split(" ")[1];
        } else if (req.query.token) {
            return req.query.token[0] as string;
        }
        return "";
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>("roles", context.getHandler());
        /* eslint-disable */
        if (!roles) {
            return true;
        }
        /* eslint-enable */
        const request: Req = context.switchToHttp().getRequest();
        const token = this.fromHeaderOrQueryString(request);
        const jwtPayload: AuthPayload = this.jwtService.decode(token) as AuthPayload;
        if (jwtPayload.sub && super.canActivate(context) as boolean) {
            const ourUser = await this.userService.getUserById(jwtPayload.userId);
            return this.matchRoles(roles, ourUser.type);
        }
        return false;
    }
}
