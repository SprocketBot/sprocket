import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {config} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {AuthenticationController} from "./authentication.controller";
import {AuthenticationResolver} from "./authentication.resolver";
import {AuthenticationService} from "./authentication.service";
import {DiscordStrategy} from "./strategies/discord/discord.strategy";
import {EpicStrategy} from "./strategies/epic/epic.strategy";
import {GoogleStrategy} from "./strategies/google/google.strategy";
import {JwtStrategy} from "./strategies/jwt/jwt.strategy";
import {SteamStrategy} from "./strategies/steam/steam.strategy";

@Module({
    imports: [
        DatabaseModule,
        PassportModule.register({session: false}),
        JwtModule.register({
            secret: config.auth.jwt.secret,
            signOptions: {expiresIn: config.auth.jwt_expiry},
        }),
    ],
    providers: [
        GoogleStrategy,
        JwtStrategy,
        EpicStrategy,
        AuthenticationResolver,
        AuthenticationService,
        DiscordStrategy,
        SteamStrategy,
    ],
    controllers: [AuthenticationController],
})
export class AuthenticationModule {}
