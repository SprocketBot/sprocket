import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {VerifyCallback} from "passport-google-oauth20";
import {Strategy} from "passport-google-oauth20";

import type {User} from "$models";
import {UserAuthenticationAccountRepository} from "$repositories";
import {UserAuthenticationAccountType} from "$types";

import type {GoogleProfile} from "./google.types";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor(private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository) {
        super({
            clientID: config.auth.google.clientId,
            clientSecret: config.auth.google.secret,
            callbackURL: config.auth.google.callbackUrl,
            scope: ["email", "profile"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback,
    ): Promise<User | undefined> {
        const userAcc = await this.userAuthenticationAccountRepository.getOrNull({
            where: {
                accountType: UserAuthenticationAccountType.GOOGLE,
                accountId: profile.id,
            },
            relations: {user: true},
        });

        if (!userAcc) {
            done(new UnauthorizedException("User not found"));
            return undefined;
        }

        done(null, userAcc.user);
        return userAcc.user;
    }
}
