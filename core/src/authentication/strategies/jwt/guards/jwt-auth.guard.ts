import {Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";

import {JwtAuthPayloadSchema} from "../jwt.types";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleRequest(err, payload): any {
        if (err || !payload) throw err || new UnauthorizedException();

        const data = JwtAuthPayloadSchema.safeParse(payload);
        if (!data.success) throw new UnauthorizedException("Token is not valid for authentication");

        return data.data;
    }
}
