import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {config} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {AuthenticationController} from "./authentication.controller";
import {EpicStrategy} from "./strategies/epic/epic.strategy";
import {GoogleStrategy} from "./strategies/google/google.strategy";
import {JwtStrategy} from "./strategies/jwt/jwt.strategy";

@Module({
    imports: [
        DatabaseModule,
        PassportModule.register({session: true}),
        JwtModule.register({
            secret: config.auth.jwt.secret,
            signOptions: {expiresIn: config.auth.jwt_expiry},
        }),
    ],
    providers: [GoogleStrategy, JwtStrategy, EpicStrategy],
    controllers: [AuthenticationController],
})
export class AuthenticationModule {}
