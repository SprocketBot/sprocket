import {Injectable} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";

import type { JwtAuthPayload, JwtPayload} from "../jwt.types";
import {JwtType} from "../jwt.types";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    handleRequest(err: Error | undefined, user: JwtPayload | undefined): JwtAuthPayload {
        if (user?.type !== JwtType.Authentication) throw new Error("Bad token");
        return user;
    }
}
