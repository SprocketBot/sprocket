import {Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";

import {JwtRefreshPayloadSchema} from "../jwt.types";

@Injectable()
export class JwtRefreshGuard extends AuthGuard("jwt") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleRequest(err, payload): any {
        if (err || !payload) throw err || new UnauthorizedException();

        console.log(payload);

        const data = JwtRefreshPayloadSchema.safeParse(payload);
        if (!data.success) throw new UnauthorizedException("Token is not valid for refresh authentication");

        return data.data;
    }
}
