import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {VerifyCallback} from "passport-google-oauth20";
import {Strategy} from "passport-google-oauth20";

import type {User} from "$models";
import {UserAuthenticationAccountRepository, UserProfiledRepository} from "$repositories";
import {UserAuthenticationAccountType} from "$types";

import type {GoogleProfileType} from "../types/profile.type";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor(
        private readonly userProfiledRepository: UserProfiledRepository,
        private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository,
    ) {
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
        profile: GoogleProfileType,
        done: VerifyCallback,
    ): Promise<User | undefined> {
        // First, check if the user already exists
        let user = await this.userProfiledRepository.primaryRepository.getOrNull({
            where: {profile: {email: profile.emails[0].value}},
        });

        // If no users returned from query, create a new one
        if (!user) {
            user = await this.userProfiledRepository.createAndSave({
                profile: {
                    email: profile.emails[0].value,
                    displayName: `${profile.name.givenName} ${profile.name.familyName.charAt(0)}`,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                },
            });
            await this.userAuthenticationAccountRepository.createAndSave({
                accountType: UserAuthenticationAccountType.GOOGLE,
                accountId: profile.emails[0].value,
                oauthToken: accessToken,
                userId: user.id,
            });
        }

        done(null, user);
        return user;
    }
}
